import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const allow = process.env.ALLOW_ADMIN_MAINTENANCE === "true"

  if (!url || !serviceRoleKey) {
    return NextResponse.json({ error: "Supabase URL or service role key not configured" }, { status: 400 })
  }
  if (!allow) {
    return NextResponse.json({ error: "Admin maintenance not allowed. Set ALLOW_ADMIN_MAINTENANCE=true in .env.local" }, { status: 403 })
  }

  let keepEmail = process.env.DEFAULT_USER_EMAIL || ""
  try {
    const body = await req.json().catch(() => null)
    if (body && typeof body.keepEmail === "string") {
      keepEmail = body.keepEmail
    }
  } catch {}

  if (!keepEmail) {
    return NextResponse.json({ error: "No keepEmail provided and DEFAULT_USER_EMAIL not set" }, { status: 400 })
  }

  const supabase = createClient(url, serviceRoleKey)

  try {
    // Collect all users (paginate if needed)
    const deleted: string[] = []
    const errors: string[] = []
    let page = 1
    const perPage = 200
    let totalProcessed = 0
    let targetUserId: string | null = null

    // Fetch until no more users
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status || 500 })
      }
      const users = data?.users || []
      if (users.length === 0) break

      for (const u of users) {
        const email = (u.email || "").toLowerCase()
        if (email === keepEmail.toLowerCase()) {
          targetUserId = u.id
          continue
        }
        // Delete any user that is not the keeper
        const delRes = await supabase.auth.admin.deleteUser(u.id)
        if (delRes.error) {
          errors.push(`${email}: ${delRes.error.message}`)
        } else {
          deleted.push(email)
        }
      }

      totalProcessed += users.length
      page += 1
    }

    // Update metadata for the kept user
    let updated = false
    if (targetUserId) {
      const { error: updErr } = await supabase.auth.admin.updateUserById(targetUserId, {
        user_metadata: {
          first_name: "Haidery",
          last_name: "Shango",
          role: "admin",
          status: "active",
        },
        app_metadata: {
          role: "admin",
        },
      })
      if (updErr) {
        errors.push(`update ${keepEmail}: ${updErr.message}`)
      } else {
        updated = true
      }
    }

    return NextResponse.json({
      keepEmail,
      updated,
      deleted_count: deleted.length,
      deleted,
      errors,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"