import { createClient } from "@supabase/supabase-js"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function main() {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. Aborting.")
      process.exit(1)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check table accessibility
    const check = await supabase.from("registrations").select("id").limit(1)
    if (check.error) {
      console.error("Cannot access 'registrations' table. Please ensure the table exists in Supabase and RLS policies allow service role.")
      console.error("Supabase error:", check.error.message)
      process.exit(1)
    }

    const filePath = path.join(process.cwd(), "registrations.json")
    let fileContent
    try {
      fileContent = await fs.readFile(filePath, "utf-8")
    } catch (e) {
      console.error("registrations.json not found at:", filePath)
      process.exit(1)
    }

    let parsed
    try {
      parsed = JSON.parse(fileContent)
    } catch (e) {
      console.error("Failed to parse registrations.json as JSON. Aborting.")
      process.exit(1)
    }

    const emails = Array.isArray(parsed?.emails) ? parsed.emails.filter((e) => typeof e === "string" && e.includes("@")) : []
    if (emails.length === 0) {
      console.log("No emails to backfill from registrations.json.")
      process.exit(0)
    }

    // Build deterministic registration_number from email hash to ensure idempotent upsert
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`

    const rows = emails.map((email) => {
      const hash = crypto.createHash("sha1").update(email).digest("hex").slice(0, 10)
      const registration_number = `BF-${dateStr}-${hash}`
      return {
        registration_number,
        first_name: "Unknown",
        last_name: "Unknown",
        email,
        phone: "N/A",
        address: "N/A",
        city: "N/A",
        country: null,
        emergency_contact: "N/A",
        emergency_phone: "N/A",
        vehicle_model: "Unknown",
        vehicle_year: "Unknown",
        model_description: "Unknown",
        engine_size: null,
        modifications: "",
        accommodation_type: null,
        dietary_restrictions: "",
        medical_conditions: "",
        previous_participation: false,
        hear_about_us: "Backfill",
        terms_accepted: false,
        insurance_confirmed: false,
        safety_acknowledged: false,
        media_consent: false,
      }
    })

    // Upsert rows; conflict on registration_number ensures idempotency
    const { data, error } = await supabase
      .from("registrations")
      .upsert(rows, { onConflict: "registration_number" })
      .select("id, email, registration_number")

    if (error) {
      console.error("Backfill upsert error:", error.message)
      process.exit(1)
    }

    console.log(`Backfill complete. Upserted ${data?.length ?? 0} rows.`)
    process.exit(0)
  } catch (err) {
    console.error("Unexpected error during backfill:", err?.message || err)
    process.exit(1)
  }
}

main()