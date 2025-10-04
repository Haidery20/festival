import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, subject, message, inquiryType } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message || !inquiryType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create transporter using SMTP environment variables
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

    const fullName = `${firstName} ${lastName}`

    // Admin notification email
    const adminMailOptions = {
      from: fromEmail,
      to: adminEmail,
      subject: `[Contact] ${subject} — ${fullName}`,
      replyTo: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>
        <hr/>
        <p>Submitted at: ${new Date().toLocaleString()}</p>
      `,
    }

    // User confirmation email
    const userMailOptions = {
      from: fromEmail,
      to: email,
      subject: `We received your message — Land Rover Festival Tanzania`,
      html: `
        <p>Hi ${firstName},</p>
        <p>Thanks for contacting Land Rover Festival Tanzania. We've received your message and our team will get back to you within 24 hours.</p>
        <p><strong>Your submission:</strong></p>
        <ul>
          <li><strong>Subject:</strong> ${subject}</li>
          <li><strong>Inquiry Type:</strong> ${inquiryType}</li>
          <li><strong>Message:</strong> ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>
        </ul>
        <p>If you need immediate assistance, call us at +255 763 652 641 or +255 759 348 343.</p>
        <p>Best regards,<br/>Land Rover Festival Tanzania Team</p>
      `,
    }

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ])

    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
