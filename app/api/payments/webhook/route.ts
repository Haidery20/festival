import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

const RESERVATIONS_FILE = path.join(process.cwd(), "reservations.json")

function ensureFile() {
  if (!fs.existsSync(RESERVATIONS_FILE)) {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify({ reservations: [] }, null, 2))
  }
}

function readReservations(): { reservations: any[] } {
  ensureFile()
  const raw = fs.readFileSync(RESERVATIONS_FILE, "utf8")
  const data = JSON.parse(raw || "{\"reservations\":[]}") as { reservations: any[] }
  if (!Array.isArray(data.reservations)) {
    data.reservations = []
  }
  return data
}

function writeReservations(reservations: any[]) {
  fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify({ reservations }, null, 2))
}

const PAID_STATUSES = new Set(["success", "paid", "completed"]) as Set<string>

export async function POST(request: NextRequest) {
  try {
    // Simple token check for webhook security
    const token = request.headers.get("x-webhook-token") || new URL(request.url).searchParams.get("token")
    const expected = process.env.PAYMENT_WEBHOOK_TOKEN
    if (!expected || token !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      reference, // expected to be reservation.id or registrationNumber
      amount, // numeric amount
      currency, // e.g., TZS
      status, // e.g., "completed" or "success"
      transaction_id, // provider transaction reference/receipt
      channel, // e.g., "mobile-money", "bank"
      payer_msisdn, // phone (optional)
      provider, // e.g., "mpesa", "tigo", "airtel", "bank"
    } = body || {}

    if (!reference || !amount || !transaction_id) {
      return NextResponse.json({ error: "Missing required fields (reference, amount, transaction_id)" }, { status: 400 })
    }

    const normalizedStatus = String(status || "").toLowerCase()
    const isPaid = PAID_STATUSES.has(normalizedStatus)

    const { reservations } = readReservations()
    const byId = reservations.find((r: any) => String(r.id) === String(reference))
    const byReg = reservations.find((r: any) => String(r.registrationNumber) === String(reference))
    const record = byId || byReg

    if (!record) {
      return NextResponse.json({ error: "Reservation not found for reference" }, { status: 404 })
    }

    if (!isPaid) {
      // Accept but do not mark as paid
      return NextResponse.json({ success: true, message: "Payment received with non-paid status", reservationId: record.id })
    }

    // Update reservation as paid
    const idx = reservations.findIndex((r: any) => String(r.id) === String(record.id))
    const nowIso = new Date().toISOString()
    record.status = "paid"
    record.paidAt = nowIso
    record.paymentMethod = channel ? String(channel) : (record.paymentMethod || (provider ? String(provider) : "mobile-money"))
    record.paymentReference = String(transaction_id)
    record.amountPaid = Number(amount)
    record.currency = currency || (record.currency || "TZS")

    reservations[idx] = record
    writeReservations(reservations)

    // Optionally notify admin and user of payment confirmation
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const fromEmail = process.env.FROM_EMAIL || smtpUser
    const adminEmail = process.env.ADMIN_EMAIL || "info@landroverfestival.co.tz"

    const emailsEnabled = !!(smtpHost && smtpUser && smtpPass)
    if (emailsEnabled) {
      try {
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
          subject: `[Payment Confirmed] ${record.id} — ${record.name}`,
          replyTo: record.email,
          html: `
            <h2>Reservation Paid</h2>
            <p><strong>Reservation ID:</strong> ${record.id}</p>
            <p><strong>Name:</strong> ${record.name}</p>
            <p><strong>Email:</strong> ${record.email}</p>
            <p><strong>Total:</strong> TZS ${Number(record.pricingTotal || 0).toLocaleString()}</p>
            <p><strong>Amount Paid:</strong> TZS ${Number(record.amountPaid || 0).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${record.paymentMethod || "mobile-money"}</p>
            <p><strong>Reference:</strong> ${record.paymentReference || "N/A"}</p>
            <p><strong>Paid At:</strong> ${new Date(record.paidAt).toLocaleString()}</p>
          `,
        }

        const userMail = {
          from: fromEmail,
          to: record.email,
          subject: `Payment Received — ${record.id}`,
          html: `
            <p>Hi ${String(record.name || "Participant").split(" ")[0]},</p>
            <p>We have received your payment for the Land Rover Festival reservation.</p>
            <p><strong>Reservation ID:</strong> ${record.id}</p>
            <p><strong>Amount Paid:</strong> TZS ${Number(record.amountPaid || 0).toLocaleString()}</p>
            <p><strong>Method:</strong> ${record.paymentMethod || "mobile-money"}</p>
            <p><strong>Reference:</strong> ${record.paymentReference || "N/A"}</p>
            <p>Thank you! If you need assistance, please contact info@landroverfestival.co.tz.</p>
            <p>Best regards,<br/>Land Rover Festival Tanzania Team</p>
          `,
        }

        await Promise.all([transporter.sendMail(adminMail), transporter.sendMail(userMail)])
      } catch (e) {
        console.warn("Failed to send payment emails:", (e as any)?.message || e)
      }
    }

    return NextResponse.json({ success: true, reservationId: record.id })
  } catch (error) {
    console.error("Payment webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}