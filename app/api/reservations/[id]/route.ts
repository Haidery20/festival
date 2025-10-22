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

const ALLOWED_STATUS = new Set(["pending", "paid", "cancelled", "expired"]) as Set<string>

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reservationId = params?.id
    if (!reservationId) {
      return NextResponse.json({ error: "Missing reservation id" }, { status: 400 })
    }

    const body = await request.json()
    const { status, paymentMethod, paymentReference, amountPaid, paidAt } = body

    if (!status || !ALLOWED_STATUS.has(String(status))) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    ensureFile()
    const raw = fs.readFileSync(RESERVATIONS_FILE, "utf8")
    const data = JSON.parse(raw || "{\"reservations\":[]}") as { reservations: any[] }
    const reservations = Array.isArray(data.reservations) ? data.reservations : []

    const idx = reservations.findIndex((r: any) => String(r.id) === String(reservationId))
    if (idx === -1) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    const record = reservations[idx]
    const nowIso = new Date().toISOString()

    // Update status and payment metadata
    record.status = String(status)
    if (String(status) === "paid") {
      record.paidAt = paidAt ? String(paidAt) : nowIso
      record.paymentMethod = paymentMethod ? String(paymentMethod) : (record.paymentMethod || "manual")
      record.paymentReference = paymentReference ? String(paymentReference) : (record.paymentReference || "N/A")
      if (amountPaid !== undefined && amountPaid !== null) {
        const numeric = Number(amountPaid)
        record.amountPaid = Number.isFinite(numeric) ? numeric : record.amountPaid
      } else if (record.amountPaid === undefined) {
        record.amountPaid = record.pricingTotal || 0
      }
    }

    // Persist updates
    reservations[idx] = record
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify({ reservations }, null, 2))

    // Send payment confirmation email if just marked as paid
    if (String(status) === "paid") {
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
              <p><strong>Payment Method:</strong> ${record.paymentMethod || "manual"}</p>
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
              <p><strong>Method:</strong> ${record.paymentMethod || "manual"}</p>
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
    }

    return NextResponse.json({ success: true, reservation: record })
  } catch (error) {
    console.error("Update reservation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}