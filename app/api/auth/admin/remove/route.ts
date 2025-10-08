import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email } = body as { email?: string }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const allow = process.env.ALLOW_ADMIN_MAINTENANCE === "true"

    if (!url || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase URL or service role key not configured" }, { status: 500 })
    }
    if (!allow) {
      return NextResponse.json({ error: "Admin maintenance not allowed. Set ALLOW_ADMIN_MAINTENANCE=true in .env.local" }, { status: 403 })
    }

    const supabase = createClient(url, serviceRoleKey)

    // Find the user by email
    let targetUserId: string | null = null
    let page = 1
    const perPage = 200

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status || 500 })
      }
      const users = data?.users || []
      if (users.length === 0) break
      for (const u of users) {
        const em = (u.email || "").toLowerCase()
        if (em === email.toLowerCase()) {
          targetUserId = u.id
          break
        }
      }
      if (targetUserId) break
      page += 1
    }

    if (!targetUserId) {
      return NextResponse.json({ deleted: false, error: "User not found" }, { status: 404 })
    }

    const { error: delErr } = await supabase.auth.admin.deleteUser(targetUserId)
    if (delErr) {
      return NextResponse.json({ deleted: false, error: delErr.message }, { status: delErr.status || 500 })
    }

    return NextResponse.json({ deleted: true, email })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"