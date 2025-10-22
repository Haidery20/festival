import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

const RESERVATIONS_FILE = path.join(process.cwd(), "reservations.json")

function generateReservationId() {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `RES-${ts}-${rand}`
}

function computeExpiry(days = 7) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function ensureFile() {
  if (!fs.existsSync(RESERVATIONS_FILE)) {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify({ reservations: [] }, null, 2))
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      registrationNumber,
      firstName,
      lastName,
      email,
      pricingTotal,
      pricingDetails,
    } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const reservationId = generateReservationId()
    const expiresAt = computeExpiry(7)
    const createdAt = new Date().toISOString()

    ensureFile()
    const raw = fs.readFileSync(RESERVATIONS_FILE, "utf8")
    const { reservations } = JSON.parse(raw || "{\"reservations\":[]}") as { reservations: any[] }

    const record = {
      id: reservationId,
      registrationNumber: registrationNumber || "",
      name: `${firstName} ${lastName}`,
      email,
      pricingTotal: Number(pricingTotal || 0),
      pricingDetails: String(pricingDetails || ""),
      status: "pending",
      createdAt,
      expiresAt,
    }

    reservations.push(record)
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify({ reservations }, null, 2))

    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const fromEmail = process.env.FROM_EMAIL || smtpUser
    const adminEmail = process.env.ADMIN_EMAIL || "info@landroverfestival.co.tz"

    const emailsEnabled = !!(smtpHost && smtpUser && smtpPass)
    let emailsSent = false

    if (emailsEnabled) {
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

      const adminMail = {
        from: fromEmail,
        to: adminEmail,
        subject: `[Reservation] ${reservationId} — ${record.name}`,
        replyTo: email,
        html: `
          <h2>New Payment Reservation</h2>
          <p><strong>Reservation ID:</strong> ${reservationId}</p>
          <p><strong>Name:</strong> ${record.name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Total:</strong> TZS ${record.pricingTotal.toLocaleString()}</p>
          <p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleString()}</p>
          <p><strong>Details:</strong> ${record.pricingDetails || "N/A"}</p>
          <hr/>
          <p>Created at: ${new Date(createdAt).toLocaleString()}</p>
        `,
      }

      const userMail = {
        from: fromEmail,
        to: email,
        subject: `Your 7-day reservation is created — ${reservationId}`,
        html: `
          <p>Hi ${firstName},</p>
          <p>We reserved your Land Rover Festival selections for 7 days.</p>
          <p><strong>Reservation ID:</strong> ${reservationId}</p>
          <p><strong>Total:</strong> TZS ${record.pricingTotal.toLocaleString()}</p>
          <p><strong>Expires on:</strong> ${new Date(expiresAt).toLocaleString()}</p>
          <p><strong>Summary:</strong> ${record.pricingDetails || "N/A"}</p>
          <p><strong>Pay via Lipa:</strong> Send payment to <strong>${process.env.PAYMENT_LIPA_NUMBER || "YOUR LIPA NUMBER"}</strong> and use <strong>Account Number</strong>: <code>${reservationId}</code>.</p>
          <p>As soon as the payment posts, we will automatically mark your reservation as paid and email you a confirmation.</p>
          <p>Best regards,<br/>Land Rover Festival Tanzania Team</p>
        `,
      }

      await Promise.all([transporter.sendMail(adminMail), transporter.sendMail(userMail)])
      emailsSent = true
    } else {
      console.warn("SMTP not configured. Skipping reservation emails.")
    }

    return NextResponse.json({
      success: true,
      reservationId,
      expiresAt,
      pricingTotal: record.pricingTotal,
      pricingDetails: record.pricingDetails,
      emailsSent,
    })
  } catch (error) {
    console.error("Reservation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    ensureFile()
    const raw = fs.readFileSync(RESERVATIONS_FILE, "utf8")
    const data = JSON.parse(raw || "{\"reservations\":[]}")
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Fetch reservations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}