import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import path from "path"
import { promises as fs } from "fs"
import sharp from "sharp"
import QRCode from "qrcode"

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
      modelDescription,
      // removed: licensePlate,
      accommodationType,
    } = body

    // Create a new PDF document
    const doc = new jsPDF()

    // Add top-left (Land Rover Festival) and top-right (Government of Tanzania) logos
    try {
      const publicDir = path.join(process.cwd(), "public")
      const govSvgPath = path.join(publicDir, "gov.svg")
      const festivalSvgPath = path.join(publicDir, "festivallogo.svg")

      const [govSvg, festivalSvg] = await Promise.all([
        fs.readFile(govSvgPath),
        fs.readFile(festivalSvgPath),
      ])

      const [govPng, festivalPng] = await Promise.all([
        sharp(govSvg).png().toBuffer(),
        sharp(festivalSvg).png().toBuffer(),
      ])

      const govDataUrl = "data:image/png;base64," + govPng.toString("base64")
      const festivalDataUrl = "data:image/png;base64," + festivalPng.toString("base64")

      const logoWidth = 30 // mm
      const logoHeight = 30 // mm
      // Inside border (15mm margin), place logos near corners
      // Top-left: x=20, y=18
      doc.addImage(festivalDataUrl, "PNG", 20, 18, logoWidth, logoHeight)
      // Top-right: right border at x=195, leave ~5mm padding
      doc.addImage(govDataUrl, "PNG", 195 - logoWidth - 5, 18, logoWidth, logoHeight)
    } catch (logoErr) {
      console.warn("Failed to load or embed logos:", logoErr)
    }
    
    // Removed wordmark and banner above logos
    // Keeping only minimal decorative dots near corners
    doc.setFillColor(45, 90, 61)
    doc.circle(45, 25, 2, 'F')
    doc.circle(195, 25, 2, 'F')
    
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
    doc.text(`Model Description: ${modelDescription}`, 20, yPosition)
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
    doc.text("Dates: November 28-30, 2025", 20, yPosition)
    yPosition += 7
    doc.text("Location: Iringa Region, Tanzania", 20, yPosition)
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
      "• Contact us at info@landroverfestival.co.tz for any questions"
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

    // QR code: link to digital form
    try {
      const origin = request.nextUrl.origin
      const qrContent = `${origin}/register?rn=${encodeURIComponent(registrationNumber)}`
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        margin: 1,
        scale: 6,
        color: { dark: "#000000", light: "#FFFFFF" },
      })
      const qrSize = 35 // mm
      const qrX = 190 - qrSize // align right within border
      const qrY = 230 // near bottom above border
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text("Scan to view your digital registration", qrX + qrSize / 2, qrY + qrSize + 6, { align: "center" })
    } catch (qrErr) {
      console.warn("Failed to generate/embed QR code:", qrErr)
    }

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

export async function GET(request: NextRequest) {
  try {
    // Sample data for previewing the PDF
    const sample = {
      registrationNumber: "SAMPLE-0001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+255 700 000 000",
      vehicleModel: "Defender",
      vehicleYear: "1997",
      modelDescription: "90",
      accommodationType: "Camping",
    }

    const doc = new jsPDF()

    // Add top-left (Land Rover Festival) and top-right (Government of Tanzania) logos
    try {
      const publicDir = path.join(process.cwd(), "public")
      const govSvgPath = path.join(publicDir, "gov.svg")
      const festivalSvgPath = path.join(publicDir, "festivallogo.svg")

      const [govSvg, festivalSvg] = await Promise.all([
        fs.readFile(govSvgPath),
        fs.readFile(festivalSvgPath),
      ])

      const [govPng, festivalPng] = await Promise.all([
        sharp(govSvg).png().toBuffer(),
        sharp(festivalSvg).png().toBuffer(),
      ])

      const govDataUrl = "data:image/png;base64," + govPng.toString("base64")
      const festivalDataUrl = "data:image/png;base64," + festivalPng.toString("base64")

      const logoWidth = 30
      const logoHeight = 30
      doc.addImage(festivalDataUrl, "PNG", 20, 18, logoWidth, logoHeight)
      doc.addImage(govDataUrl, "PNG", 195 - logoWidth - 5, 18, logoWidth, logoHeight)
    } catch (logoErr) {
      console.warn("Failed to load or embed logos (GET sample):", logoErr)
    }

    // Removed centered LAND ROVER wordmark and banner above
    // doc.setFont("helvetica", "bold")
    // doc.setFontSize(18)
    // doc.setTextColor(0, 0, 0)
    // doc.text("LAND", 52, 22, { align: "left" })
    // doc.text("ROVER", 52, 37, { align: "left" })
    // doc.setTextColor(255, 215, 0)
    // doc.text("LAND", 50, 20, { align: "left" })
    // doc.text("ROVER", 50, 35, { align: "left" })
    
    // Removed FESTIVAL 2025 banner above right logo
    // doc.setFillColor(0, 0, 0)
    // doc.roundedRect(122, 17, 70, 18, 2, 2, 'F')
    // doc.setFillColor(255, 215, 0)
    // doc.setDrawColor(0, 0, 0)
    // doc.setLineWidth(1)
    // doc.roundedRect(120, 15, 70, 18, 2, 2, 'FD')
    // doc.setFont("helvetica", "bold")
    // doc.setFontSize(10)
    // doc.setTextColor(0, 0, 0)
    // doc.text("FESTIVAL 2025", 155, 22, { align: "center" })
    // doc.setFontSize(8)
    // doc.text("IRINGA", 155, 30, { align: "center" })

    // Decorations
    doc.setFillColor(45, 90, 61)
    doc.circle(45, 25, 2, 'F')
    doc.circle(195, 25, 2, 'F')

    // Header
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(40, 40, 40)
    doc.text("REGISTRATION CONFIRMATION", 105, 50, { align: "center" })

    // Separator
    doc.setLineWidth(0.5)
    doc.line(20, 55, 190, 55)

    // Body content (sample)
    let yPosition = 70
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(`Registration Number: ${sample.registrationNumber}`, 20, yPosition)
    yPosition += 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition)
    yPosition += 20

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("PARTICIPANT INFORMATION", 20, yPosition)
    yPosition += 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Name: ${sample.firstName} ${sample.lastName}`, 20, yPosition)
    yPosition += 7
    doc.text(`Email: ${sample.email}`, 20, yPosition)
    yPosition += 7
    doc.text(`Phone: ${sample.phone}`, 20, yPosition)
    yPosition += 15

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("VEHICLE INFORMATION", 20, yPosition)
    yPosition += 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Model: ${sample.vehicleModel}`, 20, yPosition)
    yPosition += 7
    doc.text(`Year: ${sample.vehicleYear}`, 20, yPosition)
    yPosition += 7
    doc.text(`Model Description: ${sample.modelDescription}`, 20, yPosition)
    yPosition += 15

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("FESTIVAL DETAILS", 20, yPosition)
    yPosition += 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Event: Land Rover Festival Tanzania 2025", 20, yPosition)
    yPosition += 7
    doc.text("Dates: November 28-30, 2025", 20, yPosition)
    yPosition += 7
    doc.text("Location: Iringa Region, Tanzania", 20, yPosition)
    yPosition += 7
    doc.text(`Accommodation: ${sample.accommodationType}`, 20, yPosition)
    yPosition += 15

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
      "• Contact us at info@landroverfestival.tz for any questions",
    ]
    notes.forEach((note) => {
      doc.text(note, 20, yPosition)
      yPosition += 6
    })

    yPosition += 15

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Thank you for registering!", 105, yPosition, { align: "center" })
    yPosition += 7
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Land Rover Festival Tanzania Team", 105, yPosition, { align: "center" })

    doc.setLineWidth(1)
    doc.rect(15, 15, 180, 267)

    // QR code (GET sample)
    try {
      const origin = request.nextUrl.origin
      const qrContent = `${origin}/register?rn=${encodeURIComponent(sample.registrationNumber)}`
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        margin: 1,
        scale: 6,
        color: { dark: "#000000", light: "#FFFFFF" },
      })
      const qrSize = 35
      const qrX = 190 - qrSize
      const qrY = 230
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text("Scan to view your digital registration", qrX + qrSize / 2, qrY + qrSize + 6, { align: "center" })
    } catch (qrErr) {
      console.warn("Failed to generate/embed QR code (GET):", qrErr)
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="LandRover-Festival-Registration-${sample.registrationNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Sample PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate sample PDF" }, { status: 500 })
  }
}
