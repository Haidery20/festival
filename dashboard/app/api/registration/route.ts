import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Graceful fallback when Supabase env vars are missing
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      console.warn("[v0] Supabase not configured. Registrations will not be persisted in this environment.")
      return NextResponse.json(
        { success: false, message: "Supabase not configured. Registrations not persisted." },
        { status: 200 },
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      url,
      anon,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    // Insert registration into Supabase
    const { data, error } = await supabase
      .from("registrations")
      .insert({
        registration_number: body.registrationNumber,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        country: body.country,
        emergency_contact: body.emergencyContact,
        emergency_phone: body.emergencyPhone,
        vehicle_model: body.vehicleModel,
        vehicle_year: body.vehicleYear,
        model_description: body.modelDescription,
        engine_size: body.engineSize,
        modifications: body.modifications,
        accommodation_type: body.accommodationType,
        dietary_restrictions: body.dietaryRestrictions,
        medical_conditions: body.medicalConditions,
        previous_participation: body.previousParticipation,
        hear_about_us: body.hearAboutUs,
        terms_accepted: body.termsAccepted,
        insurance_confirmed: body.insuranceConfirmed,
        safety_acknowledged: body.safetyAcknowledged,
        media_consent: body.mediaConsent,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Failed to save registration" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Graceful fallback when Supabase env vars are missing
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      console.warn("[v0] Supabase not configured. Returning empty registrations list.")
      return NextResponse.json({ registrations: [] }, { status: 200 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      url,
      anon,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
    }

    return NextResponse.json({ registrations: data })
  } catch (error) {
    console.error("[v0] Fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
