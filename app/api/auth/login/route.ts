import { NextResponse } from "next/server"

// Basic in-memory tracker for failed login attempts (per process instance)
const failedLoginTracker = new Map<string, { count: number; first: number }>()
const MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS || 5)
const WINDOW_MS = Number(process.env.LOGIN_WINDOW_MS || 15 * 60 * 1000) // 15 minutes

function getClientIp(req: Request): string {
  const xfwd = req.headers.get("x-forwarded-for") || ""
  const xreal = req.headers.get("x-real-ip") || ""
  const ip = xfwd.split(",")[0].trim() || xreal.trim() || "unknown"
  return ip
}

function isSameOrigin(req: Request, isProd: boolean): boolean {
  if (!isProd) return true
  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")
  const host = req.headers.get("host")
  try {
    if (origin) {
      const o = new URL(origin)
      return o.host === host
    }
    if (referer) {
      const r = new URL(referer)
      return r.host === host
    }
    // No origin or referer: treat as not same-origin in production to mitigate CSRF from non-browser contexts
    return false
  } catch (_) {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    const isProd = process.env.NODE_ENV === "production"
    const ADMIN_USER = process.env.ADMIN_USER || (isProd ? undefined : "admin")
    const ADMIN_PASS = process.env.ADMIN_PASS || (isProd ? undefined : "password123")

    // Same-origin enforcement in production (helps mitigate CSRF)
    if (!isSameOrigin(req, isProd)) {
      console.warn(
        JSON.stringify({
          event: "auth_csrf_block",
          ip: getClientIp(req),
          time: new Date().toISOString(),
        })
      )
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    // In production, require real credentials to be set via environment
    if (isProd && (!ADMIN_USER || !ADMIN_PASS)) {
      console.error(
        JSON.stringify({
          event: "auth_env_missing",
          time: new Date().toISOString(),
        })
      )
      return NextResponse.json(
        { success: false, message: "Server credentials not configured" },
        { status: 500 }
      )
    }

    // Rate limit: block if too many recent failed attempts from IP
    const ip = getClientIp(req)
    const entry = failedLoginTracker.get(ip)
    const now = Date.now()
    if (entry && now - entry.first < WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
      console.warn(
        JSON.stringify({
          event: "auth_rate_limited",
          ip,
          time: new Date(now).toISOString(),
          windowMs: WINDOW_MS,
          maxAttempts: MAX_ATTEMPTS,
        })
      )
      return NextResponse.json({ success: false, message: "Too many attempts. Try later." }, { status: 429 })
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const res = NextResponse.json({ success: true })
      res.cookies.set("dashboard_session", "valid", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      })
      // Non-HTTP-only cookie to read client-side for display
      res.cookies.set("dashboard_user", String(username), {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      })

      // Reset tracker on successful auth
      if (entry) failedLoginTracker.delete(ip)

      console.info(
        JSON.stringify({ event: "auth_success", ip, user: String(username), time: new Date().toISOString() })
      )
      return res
    }

    // Small delay to slow brute-force attempts
    await new Promise((r) => setTimeout(r, 300))

    // Track failed attempt
    if (!entry || now - entry.first >= WINDOW_MS) {
      failedLoginTracker.set(ip, { count: 1, first: now })
    } else {
      failedLoginTracker.set(ip, { count: entry.count + 1, first: entry.first })
    }

    console.warn(
      JSON.stringify({ event: "auth_failed", ip, user: String(username), time: new Date().toISOString() })
    )
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (err) {
    console.error(JSON.stringify({ event: "auth_error", error: String(err), time: new Date().toISOString() }))
    return NextResponse.json({ success: false, message: "Bad request" }, { status: 400 })
  }
}