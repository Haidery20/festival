import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

// Simple file-based storage for registered emails (fallback when Supabase isn't configured)
const REGISTRATIONS_FILE = path.join(process.cwd(), "registrations.json")

// Helper to get Supabase client (prefers service role when available)
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// Generate a registration number when one isn't provided
function generateRegistrationNumber() {
  const prefix = "LRF"
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${year}-${rand}`
}

// Function to check if email is already registered (file-based fallback)
async function isEmailRegistered(email: string): Promise<boolean> {
  try {
    // Create the file if it doesn't exist
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify({ emails: [] }))
      return false
    }
    
    // Read existing registrations
    const data = fs.readFileSync(REGISTRATIONS_FILE, 'utf8')
    const registrations = JSON.parse(data) as RegistrationsData
    
    // Check if email exists (case insensitive)
    return registrations.emails.some((registeredEmail: string) => 
      registeredEmail.toLowerCase() === email.toLowerCase()
    )
  } catch (error) {
    console.error("Error checking email registration:", error)
    return false // Fail open if there's an error reading the file
  }
}

// Define the registration data structure
interface RegistrationsData {
  emails: string[];
}

// Function to save a new registered email (file-based fallback)
async function saveRegisteredEmail(email: string): Promise<void> {
  try {
    let registrations: RegistrationsData = { emails: [] }
    
    // Read existing registrations if file exists
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      const data = fs.readFileSync(REGISTRATIONS_FILE, 'utf8')
      registrations = JSON.parse(data) as RegistrationsData
    }
    
    // Add new email if not already in the list
    if (!registrations.emails.some((registeredEmail: string) => 
      registeredEmail.toLowerCase() === email.toLowerCase()
    )) {
      registrations.emails.push(email)
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2))
    }
  } catch (error) {
    console.error("Error saving registered email:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      country,
      emergencyContact,
      emergencyPhone,
      vehicleModel,
      vehicleYear,
      modelDescription,
      engineSize,
      modifications,
      accommodationType,
      dietaryRestrictions,
      medicalConditions,
      previousParticipation,
      hearAboutUs,
      termsAccepted,
      insuranceConfirmed,
      safetyAcknowledged,
      mediaConsent,
      // New optional kit selection
      kitSelection,
      // New kit pricing & sizes
      kitPrice,
      kitVariant,
      kitTshirtSize,
      kitTshirtSize1,
      kitTshirtSize2,
      kitShirtSize,
      // removed: licensePlate,
      registrationNumber,
      skipEmails,
    } = body

    // Normalize Series selections under Defender for consistency
    const SERIES_MODEL_VALUES = new Set(["series-i", "series-ii", "series-iia", "series-iii"]) as Set<string>
    const normalizedVehicleModel = SERIES_MODEL_VALUES.has(String(modelDescription)) ? "defender" : vehicleModel

    // Use provided registration number or generate one
    const effectiveRegistrationNumber = registrationNumber || generateRegistrationNumber()

    // Validate required fields (aligned with DB NOT NULL constraints)
    if ([
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      emergencyContact,
      emergencyPhone,
      vehicleModel,
      vehicleYear,
      modelDescription,
    ].some((v) => v === undefined || v === null)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Enforce terms and consents are accepted
    if (!termsAccepted || !insuranceConfirmed || !safetyAcknowledged || !mediaConsent) {
      return NextResponse.json({ error: "All terms and consents must be accepted" }, { status: 400 })
    }
    
    const supabase = getSupabaseClient()

    // If Supabase configured, check duplicate by email and persist the registration
    if (supabase) {
      const { data: existing, error: dupErr } = await supabase
        .from("registrations")
        .select("id")
        .ilike("email", email)
        .limit(1)
        .maybeSingle()

      if (dupErr) {
        console.error("Supabase dup check error:", dupErr)
        return NextResponse.json({ error: "Failed to validate registration" }, { status: 500 })
      }

      if (existing) {
        return NextResponse.json({ 
          error: "This email is already registered for the festival",
          code: "EMAIL_ALREADY_REGISTERED"
        }, { status: 409 })
      }

      // Insert into Supabase
      const { data: inserted, error: insertErr } = await supabase
        .from("registrations")
        .insert({
          registration_number: effectiveRegistrationNumber,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          address,
          city,
          country,
          emergency_contact: emergencyContact,
          emergency_phone: emergencyPhone,
          vehicle_model: normalizedVehicleModel,
          vehicle_year: vehicleYear,
          model_description: modelDescription,
          engine_size: engineSize,
          modifications,
          accommodation_type: accommodationType,
          dietary_restrictions: dietaryRestrictions,
          medical_conditions: medicalConditions,
          previous_participation: previousParticipation,
          hear_about_us: hearAboutUs,
          terms_accepted: termsAccepted,
          insurance_confirmed: insuranceConfirmed,
          safety_acknowledged: safetyAcknowledged,
          media_consent: mediaConsent,
        })
        .select()
        .single()

      if (insertErr) {
        console.error("Supabase insert error:", insertErr)
        return NextResponse.json({ error: "Failed to save registration" }, { status: 500 })
      }

      // Continue to send emails below
    } else {
      // Supabase not configured: check if email is already registered (file-based)
      if (await isEmailRegistered(email)) {
        return NextResponse.json({ 
          error: "This email is already registered for the festival",
          code: "EMAIL_ALREADY_REGISTERED"
        }, { status: 409 }) // 409 Conflict
      }
    }

    // SMTP configuration
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const fromEmail = process.env.FROM_EMAIL || smtpUser
    const adminEmail = process.env.ADMIN_EMAIL || "info@landroverfestival.co.tz"

    const emailsEnabled = !!(smtpHost && smtpUser && smtpPass)
    if (!emailsEnabled) {
      console.warn("SMTP configuration missing. Skipping sending emails. Set SMTP_HOST, SMTP_USER, SMTP_PASS to enable.")
    }

    // Respect preferences: load notificationsSms from local storage is client-only; on server, use environment flag
    const smsEnabled = process.env.SMS_ENABLED === "true"

    let emailsSent = false

    if (emailsEnabled && !skipEmails) {
      const securePorts = [465, 8465, 443]
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: securePorts.includes(smtpPort),
        auth: { user: smtpUser, pass: smtpPass },
        // Add conservative timeouts to prevent long hangs
        connectionTimeout: 10000, // 10s to establish TCP/TLS
        greetingTimeout: 10000,   // 10s for server greeting
        socketTimeout: 15000,     // 15s overall per operation
      })

      // Prepare registration details
      const participantName = `${firstName} ${lastName}`
      const vehicleInfo = `${vehicleYear} ${normalizedVehicleModel}`
    const modelDescriptionText = (modelDescription as string) || ""
    const accommodationTypeText = (accommodationType as string) || ""
    const kitSelectionText = (kitSelection as string) || ""
    const kitPriceText = (kitPrice as string) || ""
    const kitVariantText = (kitVariant as string) || ""
    const kitTshirtSizeText = (kitTshirtSize as string) || ""
    const kitTshirtSize1Text = (kitTshirtSize1 as string) || ""
    const kitTshirtSize2Text = (kitTshirtSize2 as string) || ""
    const kitShirtSizeText = (kitShirtSize as string) || ""

    // Compose a friendly kit details string
    const kitDetailsText = (() => {
      if (kitPriceText === "30000") {
        return `TZS 30,000 — 1 T‑shirt (Size: ${kitTshirtSizeText || "N/A"})`
      }
      if (kitPriceText === "50000") {
        if (kitVariantText === "two-ts") {
          const sizes = [kitTshirtSize1Text, kitTshirtSize2Text].filter(Boolean).join(", ") || "N/A"
          return `TZS 50,000 — Two T‑shirts (Sizes: ${sizes})`
        }
        if (kitVariantText === "tshirt-shirt") {
          return `TZS 50,000 — T‑shirt + Shirt (T: ${kitTshirtSize1Text || "N/A"}, Shirt: ${kitShirtSizeText || "N/A"})`
        }
        return `TZS 50,000`
      }
      return kitSelectionText || ""
    })()

      // Generate registration PDF via internal API
      let pdfAttachment: { filename: string; content: Buffer } | null = null
      try {
        const pdfRes = await fetch(`${request.nextUrl.origin}/api/registration/pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registrationNumber: effectiveRegistrationNumber,
            firstName,
            lastName,
            email,
            phone,
            vehicleModel: normalizedVehicleModel,
            vehicleYear,
            modelDescription: modelDescriptionText,
            accommodationType: accommodationTypeText,
            kitSelection: kitDetailsText,
          }),
        })

        if (pdfRes.ok) {
          const arrayBuf = await pdfRes.arrayBuffer()
          const pdfBuffer = Buffer.from(arrayBuf)
          pdfAttachment = {
            filename: `LandRover-Festival-Registration-${effectiveRegistrationNumber}.pdf`,
            content: pdfBuffer,
          }
        } else {
          const errText = await pdfRes.text()
          console.warn("Failed to generate registration PDF:", errText)
        }
      } catch (pdfErr) {
        console.warn("PDF generation error:", pdfErr)
      }

      // Admin notification email (no attachment by default)
      const adminMailOptions = {
        from: fromEmail,
        to: adminEmail,
        subject: `[Registration] ${effectiveRegistrationNumber} — ${participantName}`,
        replyTo: email,
        html: `
          <h2>New Registration</h2>
          <p><strong>Registration Number:</strong> ${effectiveRegistrationNumber}</p>
          <p><strong>Name:</strong> ${participantName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Vehicle:</strong> ${vehicleInfo}${modelDescriptionText ? ` (${modelDescriptionText})` : ""}</p>
          <p><strong>Accommodation:</strong> ${accommodationTypeText || "N/A"}</p>
          <p><strong>Festival Kit:</strong> ${kitDetailsText || "N/A"}</p>
          <hr/>
          <p>Submitted at: ${new Date().toLocaleString()}</p>
        `,
      }

      // Participant confirmation email (attach PDF when available)
      const userMailOptions: any = {
        from: fromEmail,
        to: email,
        subject: `Your registration is confirmed — ${effectiveRegistrationNumber}`,
        html: `
          <p>Hi ${firstName},</p>
          <p>Thank you for registering for the Land Rover Festival Tanzania 2025.</p>
          <p><strong>Your registration number:</strong> ${effectiveRegistrationNumber}</p>
          <p><strong>Vehicle:</strong> ${vehicleInfo}${modelDescriptionText ? ` (${modelDescriptionText})` : ""}</p>
          <p><strong>Accommodation:</strong> ${accommodationTypeText || "N/A"}</p>
-          <p><strong>Festival Kit:</strong> ${kitSelectionText || "N/A"}</p>
+          <p><strong>Festival Kit:</strong> ${kitDetailsText || "N/A"}</p>
          <p>We've attached your registration confirmation PDF. Please keep it for your records and bring it to the festival.</p>
          <p>If you need assistance, contact us at info@landroverfestival.co.tz.</p>
          <p>Best regards,<br/>Land Rover Festival Tanzania Team</p>
        `,
      }

      if (pdfAttachment) {
        userMailOptions.attachments = [pdfAttachment]
      }

      // Send emails in parallel
      await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(userMailOptions),
      ])

      emailsSent = true
    }

    // Save the email as registered to prevent duplicates when Supabase isn't configured
    if (!supabase) {
      await saveRegisteredEmail(email)
    }

    // SMS notification (admin mobile)
    try {
      if (smsEnabled) {
        const smsMessage = "Hurray new participant just registered."
        const smsSenderId = process.env.SMS_SENDER_ID || "Landrover Festival"
        const smsRecipient = process.env.SMS_ADMIN_NUMBER || "+255658431733"
        const messageBirdKey = process.env.MESSAGEBIRD_API_KEY
        if (messageBirdKey) {
          await fetch("https://rest.messagebird.com/messages", {
            method: "POST",
            headers: {
              Authorization: `AccessKey ${messageBirdKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ originator: smsSenderId, recipients: [smsRecipient], body: smsMessage }),
          }).catch((err) => { console.warn("MessageBird SMS send error:", err) })
        } else {
          // Development fallback: write SMS payload to local log file so you can validate the content without a provider
          try {
            const entry = { time: new Date().toISOString(), originator: smsSenderId, recipients: [smsRecipient], body: smsMessage }
            let log: any[] = []
            if (fs.existsSync(SMS_LOG_FILE)) {
              const raw = fs.readFileSync(SMS_LOG_FILE, "utf8").trim()
              if (raw) {
                log = JSON.parse(raw)
              }
            }
            log.push(entry)
            fs.writeFileSync(SMS_LOG_FILE, JSON.stringify(log, null, 2))
            console.info("[DEV] SMS not configured. Wrote SMS entry to sms-log.json.")
          } catch (fileErr) {
            console.warn("Failed to write dev SMS log:", fileErr)
          }
        }
      }
    } catch (smsErr) {
      console.warn("SMS notification error:", smsErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: emailsSent ? "Registration completed successfully" : "Registration saved. Emails were not sent (SMTP not configured).",
        registrationNumber: effectiveRegistrationNumber,
        emailsSent,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    if (supabase) {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
      }

      return NextResponse.json({ registrations: data || [] }, { status: 200 })
    }

    // Fallback to file-based when Supabase isn't configured
    // Initialize file if missing
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify({ emails: [] }))
    }

    const data = fs.readFileSync(REGISTRATIONS_FILE, "utf8")
    const registrationsData = JSON.parse(data) as { emails: string[] }

    // Map saved emails to minimal registration objects for dashboard
    const registrations = (registrationsData.emails || []).map((email, idx) => ({
      id: String(idx + 1),
      registration_number: "",
      first_name: "",
      last_name: "",
      email,
      phone: "",
      address: "",
      city: "",
      country: "",
      emergency_contact: "",
      emergency_phone: "",
      vehicle_model: "",
      vehicle_year: "",
      model_description: "",
      engine_size: "",
      modifications: "",
      accommodation_type: "",
      dietary_restrictions: "",
      medical_conditions: "",
      previous_participation: false,
      hear_about_us: "",
      created_at: new Date().toISOString(),
      terms_accepted: false,
      insurance_confirmed: false,
      safety_acknowledged: false,
      media_consent: false,
    }))

    return NextResponse.json({ registrations }, { status: 200 })
  } catch (error) {
    console.error("Fetch registrations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    const email = url.searchParams.get("email")
    const registrationNumber = url.searchParams.get("registration_number")

    const supabase = getSupabaseClient()

    if (supabase) {
      let error: any = null
      if (id) {
        const res = await supabase.from("registrations").delete().eq("id", id)
        error = res.error
      } else if (registrationNumber) {
        const res = await supabase.from("registrations").delete().eq("registration_number", registrationNumber)
        error = res.error
      } else if (email) {
        const res = await supabase.from("registrations").delete().eq("email", email)
        error = res.error
      } else {
        return NextResponse.json({ error: "Missing identifier (id, registration_number, or email)" }, { status: 400 })
      }

      if (error) {
        console.error("Supabase delete error:", error)
        return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 })
      }

      return NextResponse.json({ success: true }, { status: 200 })
    }

    // File-based fallback
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify({ emails: [] }))
    }
    const raw = fs.readFileSync(REGISTRATIONS_FILE, "utf8")
    const data = JSON.parse(raw) as { emails: string[] }
    const emails = Array.isArray(data.emails) ? data.emails : []

    let changed = false
    if (id) {
      const idx = Number(id) - 1
      if (!Number.isNaN(idx) && idx >= 0 && idx < emails.length) {
        emails.splice(idx, 1)
        changed = true
      }
    } else if (email) {
      const i = emails.findIndex((e) => e === email)
      if (i >= 0) {
        emails.splice(i, 1)
        changed = true
      }
    } else {
      return NextResponse.json({ error: "Missing identifier (email or id) for file-based store" }, { status: 400 })
    }

    if (changed) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify({ emails }, null, 2))
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Delete registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      registration_number,
      email,
      // Optional overrides for PDF content if minimal data is present
      first_name,
      last_name,
      phone,
      vehicle_model,
      vehicle_year,
      model_description,
      accommodation_type,
    } = body

    const supabase = getSupabaseClient()

    let record: any = null
    if (supabase) {
      let query = supabase.from("registrations").select("*").limit(1)
      if (id) query = query.eq("id", id)
      else if (registration_number) query = query.eq("registration_number", registration_number)
      else if (email) query = query.ilike("email", email)
      else return NextResponse.json({ error: "Missing identifier (id, registration_number, or email)" }, { status: 400 })
      const { data, error } = await query.single()
      if (error) {
        console.error("Supabase fetch for resend error:", error)
        return NextResponse.json({ error: "Failed to fetch registration" }, { status: 500 })
      }
      record = data
    } else {
      // File-based fallback only has emails; construct minimal record
      if (!email) return NextResponse.json({ error: "Email required for file-based resend" }, { status: 400 })
      record = {
        registration_number: registration_number || `REG-${Date.now()}`,
        first_name: first_name || "",
        last_name: last_name || "",
        email,
        phone: phone || "",
        vehicle_model: vehicle_model || "",
        vehicle_year: vehicle_year || "",
        model_description: model_description || "",
        accommodation_type: accommodation_type || "",
      }
    }

    // SMTP configuration
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const fromEmail = process.env.FROM_EMAIL || smtpUser
    const adminEmail = process.env.ADMIN_EMAIL || "info@landroverfestival.co.tz"

    const emailsEnabled = !!(smtpHost && smtpUser && smtpPass)
    if (!emailsEnabled) {
      return NextResponse.json({ error: "SMTP not configured" }, { status: 400 })
    }

    const securePorts = [465, 8465, 443]
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: securePorts.includes(smtpPort),
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })

    // Generate PDF via internal API for attachment
    let pdfAttachment: { filename: string; content: Buffer } | null = null
    try {
      const origin = request.nextUrl.origin
      const pdfRes = await fetch(`${origin}/api/registration/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: record.registration_number,
          firstName: record.first_name,
          lastName: record.last_name,
          email: record.email,
          phone: record.phone,
          vehicleModel: record.vehicle_model,
          vehicleYear: record.vehicle_year,
          modelDescription: record.model_description,
          accommodationType: record.accommodation_type,
          kitSelection: record.kit_selection || "",
        }),
      })
      if (pdfRes.ok) {
        const arrayBuf = await pdfRes.arrayBuffer()
        pdfAttachment = {
          filename: `LandRover-Festival-Registration-${record.registration_number}.pdf`,
          content: Buffer.from(arrayBuf),
        }
      }
    } catch (err) {
      console.warn("Resend PDF generation error:", err)
    }

    const participantName = `${record.first_name || ""} ${record.last_name || ""}`.trim()
    const vehicleInfo = `${record.vehicle_year || ""} ${record.vehicle_model || ""}`.trim()

    const adminMailOptions = {
      from: fromEmail,
      to: adminEmail,
      subject: `[Resend] ${record.registration_number} — ${participantName || record.email}`,
      replyTo: record.email,
      html: `
        <h2>Resent Registration</h2>
        <p><strong>Registration Number:</strong> ${record.registration_number}</p>
        <p><strong>Name:</strong> ${participantName || "N/A"}</p>
        <p><strong>Email:</strong> ${record.email}</p>
        <p><strong>Vehicle:</strong> ${vehicleInfo || "N/A"}</p>
        <p><strong>Accommodation:</strong> ${record.accommodation_type || "N/A"}</p>
        <p><strong>Festival Kit:</strong> ${record.kit_selection || "N/A"}</p>
        <hr/>
        <p>Resent at: ${new Date().toLocaleString()}</p>
      `,
    }

    const userMailOptions: any = {
      from: fromEmail,
      to: record.email,
      subject: `Your registration confirmation — ${record.registration_number}`,
      html: `
        <p>Hi ${record.first_name || "Participant"},</p>
        <p>Here is your registration confirmation.</p>
        <p><strong>Your registration number:</strong> ${record.registration_number}</p>
        <p><strong>Vehicle:</strong> ${vehicleInfo || "N/A"}</p>
        <p><strong>Accommodation:</strong> ${record.accommodation_type || "N/A"}</p>
        <p><strong>Festival Kit:</strong> ${record.kit_selection || "N/A"}</p>
        <p>We've attached your registration confirmation PDF.</p>
        <p>If you need assistance, contact us at info@landroverfestival.co.tz.</p>
        <p>Best regards,<br/>Land Rover Festival Tanzania Team</p>
      `,
    }
    if (pdfAttachment) userMailOptions.attachments = [pdfAttachment]

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ])

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Resend error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Local SMS log file (for development fallback when provider not configured)
const SMS_LOG_FILE = path.join(process.cwd(), "sms-log.json")
