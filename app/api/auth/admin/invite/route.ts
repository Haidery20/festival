import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, name, role } = body as { email?: string; name?: string; role?: string }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase URL or service role key not configured" }, { status: 500 })
    }

    // In production, require explicit allow flag
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_ADMIN_INVITES !== "true") {
      return NextResponse.json({ error: "Admin invites disabled in production" }, { status: 403 })
    }

    const supabase = createClient(url, serviceRoleKey)

    // Determine a safe redirect URL for invite flows
    const siteUrlEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
    const hdrProto = request.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http")
    const hdrHost = request.headers.get("host")
    const origin = siteUrlEnv || (hdrHost ? `${hdrProto}://${hdrHost}` : undefined)
    // Send them to login after completing invite/password setup
    const redirectTo = origin ? `${origin}/login` : undefined

    // Try to generate an invite link
    let actionLink: string | null = null
    let userId: string | null = null

    try {
      // Prefer the Admin generateLink invite flow
      const { data, error } = await supabase.auth.admin.generateLink({ type: "invite", email, options: { redirectTo } })
      if (error) throw error
      actionLink = data?.properties?.action_link || null
      userId = data?.user?.id || null
    } catch (e) {
      // Fallback: create user without confirming, then generate signup link
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({ email, email_confirm: false })
      if (createErr) {
        // If already exists, continue
        const msg = (createErr.message || "").toLowerCase()
        if (!msg.includes("already") && !msg.includes("exists")) {
          return NextResponse.json({ error: createErr.message }, { status: createErr.status || 500 })
        }
      }
      userId = created?.user?.id || null
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({ type: "invite", email, options: { redirectTo } })
      if (linkErr) {
        return NextResponse.json({ error: linkErr.message }, { status: linkErr.status || 500 })
      }
      actionLink = linkData?.properties?.action_link || null
    }

    // If we have a user id, update metadata with provided name/role
    if (userId) {
      const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          first_name: typeof name === "string" ? name.split(" ")[0] || "" : "",
          last_name: typeof name === "string" ? name.split(" ").slice(1).join(" ") || "" : "",
          role: role || "",
          status: "invited",
        },
        app_metadata: {
          role: role || "",
        },
      })
      if (updErr) {
        // Non-fatal; continue
        // eslint-disable-next-line no-console
        console.warn("Failed to update user metadata:", updErr.message)
      }
    }

    // Send invite email via SMTP if configured; otherwise return the link
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const fromEmail = process.env.FROM_EMAIL || smtpUser

    const emailsEnabled = !!(smtpHost && smtpUser && smtpPass)

    if (emailsEnabled && actionLink) {
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

      const mailOptions = {
        from: fromEmail,
        to: email,
        subject: "You’ve been invited — Land Rover Festival Dashboard",
        html: `
          <p>Hi${name ? ` ${name}` : ""},</p>
          <p>You’ve been invited to the Land Rover Festival Dashboard. Click the button below to accept the invitation and set up your account.</p>
          <p><a href="${actionLink}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:#fff;text-decoration:none;border-radius:6px">Accept Invitation</a></p>
          <p>If the button doesn’t work, copy and paste this link into your browser:</p>
          <p><a href="${actionLink}">${actionLink}</a></p>
          ${role ? `<p>Your role: <strong>${role}</strong></p>` : ""}
          <p>Thank you!</p>
        `,
      }

      try {
        await transporter.sendMail(mailOptions)
      } catch (e: any) {
        // If email fails, still return the link so the UI can show it
        return NextResponse.json({ invited: true, email, link: actionLink, emailSent: false, error: e?.message || "Failed to send email" })
      }

      return NextResponse.json({ invited: true, email, emailSent: true })
    }

    // SMTP not configured or link missing — return the link for manual sharing
    return NextResponse.json({ invited: !!actionLink, email, link: actionLink || null, emailSent: false })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"