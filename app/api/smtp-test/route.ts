import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { to, subject, message } = body as { to?: string; subject?: string; message?: string }

    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const fromEmail = process.env.FROM_EMAIL || smtpUser
    const defaultRecipient = process.env.ADMIN_EMAIL || smtpUser

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
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

    // Verify SMTP connectivity
    let verified = false
    try {
      verified = await transporter.verify()
    } catch (e) {
      return NextResponse.json({ success: false, verified: false, error: "SMTP verify failed" }, { status: 500 })
    }

    const mailOptions = {
      from: fromEmail,
      to: to || defaultRecipient,
      subject: subject || "SMTP Test — Land Rover Festival",
      text: message || "This is a test message confirming your SMTP settings can send email.",
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      verified,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      envelope: info.envelope,
      response: info.response,
    })
  } catch (error) {
    console.error("SMTP test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}