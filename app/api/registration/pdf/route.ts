import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      registrationNumber,
      firstName,
      lastName,
      email,
      phone,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      licensePlate,
      accommodationType,
    } = body

    // Create a new PDF document
    const doc = new jsPDF()
    
    // Draw the Enhanced Land Rover Festival Logo
    
    // LAND ROVER text with 3D effect
    doc.setFont("helvetica", "bold")
    
    // Shadow for LAND ROVER (3D effect)
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0) // Black shadow
    doc.text("LAND", 52, 22, { align: "left" })
    doc.text("ROVER", 52, 37, { align: "left" })
    
    // Main LAND ROVER text
    doc.setTextColor(255, 215, 0) // Gold color
    doc.text("LAND", 50, 20, { align: "left" })
    doc.text("ROVER", 50, 35, { align: "left" })
    
    // Green outline effect
    doc.setDrawColor(45, 90, 61) // Dark green
    doc.setLineWidth(0.5)
    doc.setFillColor(255, 215, 0) // Gold fill
    
    // Festival 2025 banner with enhanced styling
    // Banner shadow
    doc.setFillColor(0, 0, 0) // Black shadow
    doc.roundedRect(122, 17, 70, 18, 2, 2, 'F')
    
    // Main banner
    doc.setFillColor(255, 215, 0) // Gold color
    doc.setDrawColor(0, 0, 0) // Black border
    doc.setLineWidth(1)
    doc.roundedRect(120, 15, 70, 18, 2, 2, 'FD')
    
    // Banner text
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0) // Black text
    doc.text("FESTIVAL 2025", 155, 22, { align: "center" })
    doc.setFontSize(8)
    doc.text("IRINGA", 155, 30, { align: "center" })
    
    // Add decorative elements
    doc.setFillColor(45, 90, 61) // Dark green
    doc.circle(45, 25, 2, 'F') // Left decoration
    doc.circle(195, 25, 2, 'F') // Right decoration
    
    // Set font and colors for main content
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(40, 40, 40)
    
    // Header
    doc.text("REGISTRATION CONFIRMATION", 105, 50, { align: "center" })
    
    // Add a line separator
    doc.setLineWidth(0.5)
    doc.line(20, 55, 190, 55)
    
    // Registration details
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    
    let yPosition = 70
    
    // Registration Number (highlighted)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(`Registration Number: ${registrationNumber}`, 20, yPosition)
    yPosition += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition)
    yPosition += 20
    
    // Participant Information
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("PARTICIPANT INFORMATION", 20, yPosition)
    yPosition += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Name: ${firstName} ${lastName}`, 20, yPosition)
    yPosition += 7
    doc.text(`Email: ${email}`, 20, yPosition)
    yPosition += 7
    doc.text(`Phone: ${phone}`, 20, yPosition)
    yPosition += 15
    
    // Vehicle Information
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("VEHICLE INFORMATION", 20, yPosition)
    yPosition += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Model: ${vehicleModel}`, 20, yPosition)
    yPosition += 7
    doc.text(`Year: ${vehicleYear}`, 20, yPosition)
    yPosition += 7
    doc.text(`Color: ${vehicleColor}`, 20, yPosition)
    yPosition += 7
    doc.text(`License Plate: ${licensePlate}`, 20, yPosition)
    yPosition += 15
    
    // Festival Details
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("FESTIVAL DETAILS", 20, yPosition)
    yPosition += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Event: Land Rover Festival Tanzania 2025", 20, yPosition)
    yPosition += 7
    doc.text("Dates: July 15-17, 2025", 20, yPosition)
    yPosition += 7
    doc.text("Location: Serengeti Region, Northern Tanzania", 20, yPosition)
    yPosition += 7
    doc.text(`Accommodation: ${accommodationType}`, 20, yPosition)
    yPosition += 15
    
    // Important Notes
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("IMPORTANT NOTES", 20, yPosition)
    yPosition += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const notes = [
      "• Please bring this confirmation to the festival",
      "• Ensure your vehicle insurance is up to date",
      "• Follow all safety guidelines during the event",
      "• Contact us at info@landroverfestival.tz for any questions"
    ]
    
    notes.forEach(note => {
      doc.text(note, 20, yPosition)
      yPosition += 6
    })
    
    yPosition += 15
    
    // Footer
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Thank you for registering!", 105, yPosition, { align: "center" })
    yPosition += 7
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Land Rover Festival Tanzania Team", 105, yPosition, { align: "center" })
    
    // Add a border
    doc.setLineWidth(1)
    doc.rect(15, 15, 180, 267)
    
    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="LandRover-Festival-Registration-${registrationNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
