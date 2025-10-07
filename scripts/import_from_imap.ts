import 'dotenv/config'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { createClient } from '@supabase/supabase-js'

// Configure via environment variables
const IMAP_HOST = process.env.IMAP_HOST!
const IMAP_PORT = Number(process.env.IMAP_PORT || 993)
const IMAP_USER = process.env.IMAP_USER!
const IMAP_PASS = process.env.IMAP_PASS!
const IMAP_FOLDER = process.env.IMAP_FOLDER || 'Sent'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!IMAP_HOST || !IMAP_USER || !IMAP_PASS || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables. Set IMAP_* and NEXT_PUBLIC_SUPABASE_*')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function extractBetween(text: string, start: string): string | null {
  const idx = text.indexOf(start)
  if (idx === -1) return null
  const after = text.slice(idx + start.length)
  const endIdx = after.indexOf('</p>')
  return (endIdx !== -1 ? after.slice(0, endIdx) : after).trim()
}

function parseAdminHtml(html: string) {
  // Expecting labels exactly as sent by adminMailOptions
  const regNo = extractBetween(html, '<p><strong>Registration Number:</strong> ')
  const name = extractBetween(html, '<p><strong>Name:</strong> ')
  const email = extractBetween(html, '<p><strong>Email:</strong> ')
  const phone = extractBetween(html, '<p><strong>Phone:</strong> ')
  const vehicleRaw = extractBetween(html, '<p><strong>Vehicle:</strong> ')
  const accommodation = extractBetween(html, '<p><strong>Accommodation:</strong> ')

  let vehicle_year: string | null = null
  let vehicle_model: string | null = null
  let model_description: string | null = null
  if (vehicleRaw) {
    const descStart = vehicleRaw.indexOf('(')
    const descEnd = vehicleRaw.indexOf(')')
    const base = descStart !== -1 ? vehicleRaw.slice(0, descStart).trim() : vehicleRaw.trim()
    const parts = base.split(' ')
    if (parts.length >= 2) {
      vehicle_year = parts[0]
      vehicle_model = parts.slice(1).join(' ')
    } else {
      vehicle_model = base
    }
    if (descStart !== -1 && descEnd !== -1 && descEnd > descStart) {
      model_description = vehicleRaw.slice(descStart + 1, descEnd)
    }
  }

  let first_name: string | null = null
  let last_name: string | null = null
  if (name) {
    const parts = name.split(' ')
    first_name = parts[0]
    last_name = parts.slice(1).join(' ').trim() || null
  }

  return {
    registration_number: regNo || null,
    first_name,
    last_name,
    email: email || null,
    phone: phone || null,
    vehicle_model,
    vehicle_year,
    model_description,
    accommodation_type: accommodation || null,
  }
}

async function upsertRegistration(rec: any) {
  if (!rec.registration_number || !rec.email || !rec.first_name || !rec.last_name || !rec.phone || !rec.vehicle_model || !rec.vehicle_year) {
    console.warn('Skipping incomplete record', rec)
    return
  }
  const { error } = await supabase
    .from('registrations')
    .upsert(
      {
        registration_number: rec.registration_number,
        first_name: rec.first_name,
        last_name: rec.last_name,
        email: rec.email,
        phone: rec.phone,
        address: '',
        city: '',
        country: null,
        emergency_contact: '',
        emergency_phone: '',
        vehicle_model: rec.vehicle_model,
        vehicle_year: rec.vehicle_year,
        model_description: rec.model_description || '',
        engine_size: null,
        modifications: '',
        accommodation_type: rec.accommodation_type,
        dietary_restrictions: '',
        medical_conditions: '',
        previous_participation: false,
        hear_about_us: '',
        terms_accepted: true,
        insurance_confirmed: true,
        safety_acknowledged: true,
        media_consent: false,
      },
      { onConflict: 'registration_number' }
    )
  if (error) {
    console.error('Upsert error', error)
  }
}

async function main() {
  const client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: IMAP_PORT === 993, // use SSL only for 993
    auth: { user: IMAP_USER, pass: IMAP_PASS },
    logger: false,
  })
  await client.connect()

  // Open Sent mailbox
  const lock = await client.getMailboxLock(IMAP_FOLDER)
  try {
    // Search for subjects starting with "[Registration]"
    const searchResult = await client.search({ subject: '[Registration]' })
    const seqNumbers = Array.isArray(searchResult) ? searchResult : []

    // Fallback: if nothing found by subject, scan the latest 500 messages in the folder
    if (seqNumbers.length === 0) {
      const allSeqResult = await client.search({ all: true })
      const allSeq = Array.isArray(allSeqResult) ? allSeqResult : []
      const recentSeq = allSeq.slice(Math.max(0, allSeq.length - 500))
      console.log(`No subject matches found. Scanning ${recentSeq.length} recent messages for New Registration HTML...`)

      for await (const msg of client.fetch(recentSeq, { source: true })) {
        const parsed = await simpleParser(msg.source as Buffer)
        const html = parsed.html || ''
        const subject = parsed.subject || ''
        if (!html.includes('<h2>New Registration</h2>')) continue
        const rec = parseAdminHtml(html)
        if (!rec.registration_number && subject.startsWith('[Registration] ')) {
          const subj = subject.replace('[Registration] ', '')
          const parts = subj.split(' — ')
          if (parts.length >= 1) {
            rec.registration_number = parts[0]
          }
          if (parts.length >= 2 && !rec.first_name) {
            const nameParts = parts[1].split(' ')
            rec.first_name = nameParts[0]
            rec.last_name = nameParts.slice(1).join(' ')
          }
        }
        await upsertRegistration(rec)
      }
      return
    }

    console.log(`Found ${seqNumbers.length} messages with subject [Registration]`)

    for await (const msg of client.fetch(seqNumbers, { source: true })) {
      const parsed = await simpleParser(msg.source as Buffer)
      const html = parsed.html || ''
      const subject = parsed.subject || ''

      // Basic sanity check
      if (!html.includes('<h2>New Registration</h2>')) continue

      const rec = parseAdminHtml(html)
      if (!rec.registration_number && subject.startsWith('[Registration] ')) {
        // Try to extract number from subject: [Registration] ABC123 — John Doe
        const subj = subject.replace('[Registration] ', '')
        const parts = subj.split(' — ')
        if (parts.length >= 1) {
          rec.registration_number = parts[0]
        }
        if (parts.length >= 2 && !rec.first_name) {
          const nameParts = parts[1].split(' ')
          rec.first_name = nameParts[0]
          rec.last_name = nameParts.slice(1).join(' ')
        }
      }

      await upsertRegistration(rec)
    }
  } finally {
    lock.release()
  }

  await client.logout()
}

main().catch((err) => {
  console.error('Importer error', err)
  process.exit(1)
})