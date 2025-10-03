import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      vehicleModel,
      vehicleYear,
      // removed: licensePlate,
      registrationNumber,
      ...otherData
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !vehicleModel || !vehicleYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // For now, we'll just log the registration
    console.log("Vehicle registration:", {
      registrationNumber,
      participant: `${firstName} ${lastName}`,
      email,
      phone,
      vehicle: `${vehicleYear} ${vehicleModel}`,
      // removed: licensePlate,
      timestamp: new Date().toISOString(),
      ...otherData,
    })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json(
      {
        success: true,
        message: "Registration completed successfully",
        registrationNumber,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
