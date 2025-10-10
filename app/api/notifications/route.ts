import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const REGISTRATIONS_FILE = path.join(process.cwd(), "registrations.json")

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Prefer real data from Supabase registrations (derive notifications from recent registrations)
    if (supabase) {
      const { data, error } = await supabase
        .from("registrations")
        .select("id, first_name, last_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(25)

      if (error) {
        console.error("Supabase notifications fetch error:", error)
      } else {
        const list = (data || []).map((r) => ({
          id: String((r as any).id ?? `${(r as any).email}-${(r as any).created_at}`),
          title: "New registration",
          message: `${(r as any).first_name || ""} ${(r as any).last_name || ""}`.trim() || (r as any).email || "New registration",
          href: "/dashboard",
          read: false,
          created_at: (r as any).created_at || new Date().toISOString(),
        }))
        return NextResponse.json(list)
      }
    }

    // Fallback: derive notifications from file-based registrations storage
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify({ emails: [] }))
    }
    const raw = fs.readFileSync(REGISTRATIONS_FILE, "utf8")
    const data = JSON.parse(raw) as { emails: string[] }
    const emails = Array.isArray(data.emails) ? data.emails : []

    const list = emails.slice(-25).reverse().map((email, idx) => ({
      id: `file-${idx + 1}`,
      title: "New registration",
      message: email,
      href: "/dashboard",
      read: false,
      created_at: new Date().toISOString(),
    }))

    return NextResponse.json(list)
  } catch (error) {
    console.error("Notifications GET error:", error)
    return NextResponse.json([], { status: 200 })
  }
}