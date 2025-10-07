import { NextResponse } from "next/server"

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
    return false
  } catch (_) {
    return false
  }
}

export async function POST(req: Request) {
  const isProd = process.env.NODE_ENV === "production"
  if (!isSameOrigin(req, isProd)) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
  }

  const res = NextResponse.json({ success: true })
  // Expire cookies to log out securely
  const expires = new Date(0)
  res.cookies.set("dashboard_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProd,
    expires,
  })
  res.cookies.set("dashboard_user", "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: isProd,
    expires,
  })
  return res
}