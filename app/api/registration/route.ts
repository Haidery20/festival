import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

// Simple file-based storage for registered emails
const REGISTRATIONS_FILE = path.join(process.cwd(), "registrations.json")

// Function to check if email is already registered
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

// Function to save a new registered email
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
      vehicleModel,
      vehicleYear,
      // removed: licensePlate,
      registrationNumber,
      ...otherData
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !vehicleModel || !vehicleYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Check if email is already registered
    if (await isEmailRegistered(email)) {
      return NextResponse.json({ 
        error: "This email is already registered for the festival",
        code: "EMAIL_ALREADY_REGISTERED"
      }, { status: 409 }) // 409 Conflict
    }

    // SMTP configuration
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const fromEmail = process.env.FROM_EMAIL || smtpUser
    const adminEmail = process.env.ADMIN_EMAIL || "info@landroverfestival.co.tz"

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error("SMTP configuration missing. Set SMTP_HOST, SMTP_USER, SMTP_PASS.")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

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
    const modelDescription = (otherData?.modelDescription as string) || ""
    const accommodationType = (otherData?.accommodationType as string) || ""

    // Generate registration PDF via internal API
    let pdfAttachment: { filename: string; content: Buffer } | null = null
    try {
      const pdfRes = await fetch(`${request.nextUrl.origin}/api/registration/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber,
          firstName,
          lastName,
          email,
          phone,
          vehicleModel,
          vehicleYear,
          modelDescription,
          accommodationType,
        }),
      })

      if (pdfRes.ok) {
        const arrayBuf = await pdfRes.arrayBuffer()
        const pdfBuffer = Buffer.from(arrayBuf)
        pdfAttachment = {
          filename: `LandRover-Festival-Registration-${registrationNumber}.pdf`,
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
      subject: `[Registration] ${registrationNumber} — ${participantName}`,
      replyTo: email,
      html: `
        <h2>New Registration</h2>
        <p><strong>Registration Number:</strong> ${registrationNumber}</p>
        <p><strong>Name:</strong> ${participantName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Vehicle:</strong> ${vehicleInfo}${modelDescription ? ` (${modelDescription})` : ""}</p>
        <p><strong>Accommodation:</strong> ${accommodationType || "N/A"}</p>
        <hr/>
        <p>Submitted at: ${new Date().toLocaleString()}</p>
      `,
    }

    // Participant confirmation email (attach PDF when available)
    const userMailOptions: any = {
      from: fromEmail,
      to: email,
      subject: `Your registration is confirmed — ${registrationNumber}`,
      html: `
        <p>Hi ${firstName},</p>
        <p>Thank you for registering for the Land Rover Festival Tanzania 2025.</p>
        <p><strong>Your registration number:</strong> ${registrationNumber}</p>
        <p><strong>Vehicle:</strong> ${vehicleInfo}${modelDescription ? ` (${modelDescription})` : ""}</p>
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

    // Save the email as registered to prevent duplicates
    await saveRegisteredEmail(email)

    // Simulate processing time
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json(
      {
        success: true,
        message: "Registration completed successfully",
        registrationNumber,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
