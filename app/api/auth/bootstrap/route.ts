import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email = process.env.DEFAULT_USER_EMAIL
  const password = process.env.DEFAULT_USER_PASSWORD

  if (!url || !serviceRoleKey) {
    return NextResponse.json({ error: "Supabase URL or service role key not configured" }, { status: 400 })
  }
  if (!email || !password) {
    return NextResponse.json({ error: "DEFAULT_USER_EMAIL or DEFAULT_USER_PASSWORD env not set" }, { status: 400 })
  }

  // Prevent accidental bootstrap in production unless explicitly allowed
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_BOOTSTRAP !== "true") {
    return NextResponse.json({ error: "Bootstrap disabled in production" }, { status: 403 })
  }

  const supabase = createClient(url, serviceRoleKey)

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      // If the user already exists, treat this as success
      const msg = (error.message || "").toLowerCase()
      if (msg.includes("already") || msg.includes("exists")) {
        return NextResponse.json({ created: false, email })
      }
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json({ created: true, email, id: data?.user?.id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"