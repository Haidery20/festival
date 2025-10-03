"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface RegistrationData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  emergencyContact: string
  emergencyPhone: string

  // Vehicle Information
  vehicleModel: string
  vehicleYear: string
  modelDescription: string
  // removed: licensePlate
  // removed: engineSize
  modifications: string

  // Festival Information
  accommodationType: string
  dietaryRestrictions: string
  medicalConditions: string
  previousParticipation: boolean
  hearAboutUs: string

  // Agreements
  termsAccepted: boolean
  insuranceConfirmed: boolean
  safetyAcknowledged: boolean
  mediaConsent: boolean
}

export function RegistrationForm() {
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    emergencyContact: "",
    emergencyPhone: "",
    vehicleModel: "",
    vehicleYear: "",
    modelDescription: "",
    // removed: licensePlate
    // removed: engineSize
    modifications: "",
    accommodationType: "",
    dietaryRestrictions: "",
    medicalConditions: "",
    previousParticipation: false,
    hearAboutUs: "",
    termsAccepted: false,
    insuranceConfirmed: false,
    safetyAcknowledged: false,
    mediaConsent: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState("")
  const { toast } = useToast()

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateRegistrationNumber = () => {
    const prefix = "LRF2025"
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    return `${prefix}-${randomNum}`
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch("/api/registration/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          registrationNumber,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `LandRover-Festival-Registration-${registrationNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "PDF Downloaded",
          description: "Your registration confirmation has been downloaded.",
        })
      } else {
        throw new Error("Failed to generate PDF")
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Form submission started", formData)

    // Validate required checkboxes
    if (!formData.termsAccepted || !formData.insuranceConfirmed || !formData.safetyAcknowledged || !formData.mediaConsent) {
      console.log("[v0] Validation failed - missing required checkboxes")
      toast({
        title: "Please accept all required terms",
        description: "You must accept the terms, confirm insurance, acknowledge safety requirements, and consent to media capture.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const regNumber = generateRegistrationNumber()
      setRegistrationNumber(regNumber)
      console.log("[v0] Generated registration number:", regNumber)

      const response = await fetch("/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          registrationNumber: regNumber,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (response.ok) {
        setIsSubmitted(true)
        console.log("[v0] Registration successful")
        toast({
          title: "Registration Successful!",
          description: "Your vehicle has been registered for the festival.",
        })
      } else {
        const errorText = await response.text()
        console.log("[v0] Registration failed:", errorText)
        throw new Error("Registration failed")
      }
    } catch (error) {
      console.log("[v0] Registration error:", error)
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 text-primary mx-auto mb-4 flex items-center justify-center text-4xl">✓</div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Registration Successful!</h3>
          <p className="text-muted-foreground mb-4">
            Your registration number is: <span className="font-bold text-primary">{registrationNumber}</span>
          </p>
          <p className="text-muted-foreground mb-6">
            A confirmation email has been sent to {formData.email}. Please download your registration PDF for your
            records.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={downloadPDF} className="bg-primary hover:bg-primary/90">
              <span className="mr-2">⬇</span>
              Download Registration PDF
            </Button>
            <Button
              onClick={() => {
                setIsSubmitted(false)
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  address: "",
                  city: "",
                  country: "",
                  emergencyContact: "",
                  emergencyPhone: "",
                  vehicleModel: "",
                  vehicleYear: "",
                  modelDescription: "",
                  // removed: licensePlate
                  // removed: engineSize
                  modifications: "",
                  accommodationType: "",
                  dietaryRestrictions: "",
                  medicalConditions: "",
                  previousParticipation: false,
                  hearAboutUs: "",
                  termsAccepted: false,
                  insuranceConfirmed: false,
                  safetyAcknowledged: false,
                  mediaConsent: false,
                })
              }}
              variant="outline"
            >
              Register Another Vehicle
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">
                  Country <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tanzania">Tanzania</SelectItem>
                    <SelectItem value="kenya">Kenya</SelectItem>
                    <SelectItem value="uganda">Uganda</SelectItem>
                    <SelectItem value="rwanda">Rwanda</SelectItem>
                    <SelectItem value="burundi">Burundi</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">
                  Emergency Contact Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">
                  Emergency Contact Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">
                  Land Rover Model <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.vehicleModel}
                  onValueChange={(value) => handleInputChange("vehicleModel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defender">Defender</SelectItem>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="discovery-sport">Discovery Sport</SelectItem>
                    <SelectItem value="range-rover">Range Rover</SelectItem>
                    <SelectItem value="range-rover-sport">Range Rover Sport</SelectItem>
                    <SelectItem value="range-rover-evoque">Range Rover Evoque</SelectItem>
                    <SelectItem value="range-rover-velar">Range Rover Velar</SelectItem>
                    <SelectItem value="freelander">Freelander</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleYear">
                  Year <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vehicleYear"
                  type="number"
                  min="1970"
                  max="2025"
                  value={formData.vehicleYear}
                  onChange={(e) => handleInputChange("vehicleYear", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelDescription">
                  Model Description <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.modelDescription}
                  onValueChange={(value) => handleInputChange("modelDescription", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specific model" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Defender Variants */}
                    <SelectItem value="defender-90">Defender 90</SelectItem>
                    <SelectItem value="defender-110">Defender 110</SelectItem>
                    <SelectItem value="defender-130">Defender 130</SelectItem>
                    <SelectItem value="defender-td5">Defender Td5</SelectItem>
                    <SelectItem value="defender-300tdi">Defender 300Tdi</SelectItem>
                    <SelectItem value="defender-puma">Defender Puma (TDCi)</SelectItem>
                    {/* Discovery Variants */}
                    <SelectItem value="discovery-1">Discovery 1</SelectItem>
                    <SelectItem value="discovery-2-td5">Discovery 2 (Td5)</SelectItem>
                    <SelectItem value="discovery-3-lr3">Discovery 3 (LR3)</SelectItem>
                    <SelectItem value="discovery-4-sdv6">Discovery 4 (SDV6)</SelectItem>
                    <SelectItem value="discovery-5">Discovery 5</SelectItem>
                    {/* Range Rover Variants */}
                    <SelectItem value="range-rover-classic">Range Rover Classic</SelectItem>
                    <SelectItem value="range-rover-p38">Range Rover P38</SelectItem>
                    <SelectItem value="range-rover-l322">Range Rover L322</SelectItem>
                    <SelectItem value="range-rover-l405">Range Rover L405</SelectItem>
                    <SelectItem value="range-rover-l460">Range Rover L460</SelectItem>
                    {/* Range Rover Sport Variants */}
                    <SelectItem value="range-rover-sport-l320">Range Rover Sport L320</SelectItem>
                    <SelectItem value="range-rover-sport-l494">Range Rover Sport L494</SelectItem>
                    <SelectItem value="range-rover-sport-l461">Range Rover Sport L461</SelectItem>
                    {/* Evoque Variants */}
                    <SelectItem value="evoque-gen1">Range Rover Evoque (Gen 1)</SelectItem>
                    <SelectItem value="evoque-gen2">Range Rover Evoque (Gen 2)</SelectItem>
                    {/* Velar */}
                    <SelectItem value="velar">Range Rover Velar</SelectItem>
                    {/* Freelander */}
                    <SelectItem value="freelander-1">Freelander 1</SelectItem>
                    <SelectItem value="freelander-2">Freelander 2</SelectItem>
                    {/* Other */}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Removed License Plate field */}
              {/* Removed Engine Size field */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="modifications">Vehicle Modifications</Label>
                <Textarea
                  id="modifications"
                  placeholder="Describe any modifications to your vehicle..."
                  value={formData.modifications}
                  onChange={(e) => handleInputChange("modifications", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Festival Information */}
          {/* <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Festival Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accommodationType">
                  Accommodation Preference <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.accommodationType}
                  onValueChange={(value) => handleInputChange("accommodationType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camping">Camping</SelectItem>
                    <SelectItem value="lodge">Safari Lodge</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="own-arrangement">Own Arrangement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hearAboutUs">How did you hear about us?</Label>
                <Select value={formData.hearAboutUs} onValueChange={(value) => handleInputChange("hearAboutUs", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="land-rover-club">Land Rover Club</SelectItem>
                    <SelectItem value="friend">Friend/Word of Mouth</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="previous-participant">Previous Participant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                <Textarea
                  id="dietaryRestrictions"
                  placeholder="Please list any dietary restrictions or allergies..."
                  value={formData.dietaryRestrictions}
                  onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  placeholder="Please list any medical conditions we should be aware of..."
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <Checkbox
                  id="previousParticipation"
                  checked={formData.previousParticipation}
                  onCheckedChange={(checked) => handleInputChange("previousParticipation", checked as boolean)}
                />
                <Label htmlFor="previousParticipation">I participated in the previous Land Rover Festival</Label>
              </div>
            </div>
          </div> */}

          {/* Terms and Conditions */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Terms and Conditions</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                />
                <Label htmlFor="termsAccepted" className="text-sm leading-relaxed">
                  I accept the terms and conditions of the Land Rover Festival in Iringa, Tanzania{" "}
                   <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="insuranceConfirmed"
                  checked={formData.insuranceConfirmed}
                  onCheckedChange={(checked) => handleInputChange("insuranceConfirmed", checked as boolean)}
                />
                <Label htmlFor="insuranceConfirmed" className="text-sm leading-relaxed">
                  I confirm that my vehicle has valid insurance coverage for the duration of the event{" "}
                  <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="safetyAcknowledged"
                  checked={formData.safetyAcknowledged}
                  onCheckedChange={(checked) => handleInputChange("safetyAcknowledged", checked as boolean)}
                />
                <Label htmlFor="safetyAcknowledged" className="text-sm leading-relaxed">
                  I acknowledge the risks involved in off-road driving and agree to follow all safety guidelines{" "}
                  <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="mediaConsent"
                  checked={formData.mediaConsent}
                  onCheckedChange={(checked) => handleInputChange("mediaConsent", checked as boolean)}
                />
                <Label htmlFor="mediaConsent" className="text-sm leading-relaxed">
                  I give consent for my images/media to be captured and used for public purposes{" "}
                  <span className="text-destructive">*</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-3" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2 animate-spin">⟳</span>
                  Processing Registration...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-4">
              <span className="mr-1">⚠</span>
              You will receive a confirmation email and PDF download link after successful registration.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
