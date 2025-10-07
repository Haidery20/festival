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
      // removed: licensePlate,
      registrationNumber,
    } = body

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
          vehicle_model: vehicleModel,
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

    let emailsSent = false

    if (emailsEnabled) {
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
      const vehicleInfo = `${vehicleYear} ${vehicleModel}`
      const modelDescriptionText = (modelDescription as string) || ""
      const accommodationTypeText = (accommodationType as string) || ""

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
            vehicleModel,
            vehicleYear,
            modelDescription: modelDescriptionText,
            accommodationType: accommodationTypeText,
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
