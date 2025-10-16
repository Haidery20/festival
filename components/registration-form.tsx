"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

// Model-specific data
const defenderModels = [
  { value: "series-i", label: "Series I (1948–1958)" },
  { value: "series-ii", label: "Series II (1958–1961)" },
  { value: "series-iia", label: "Series IIA (1961–1971)" },
  { value: "series-iii", label: "Series III (1971–1985)" },
  { value: "defender-90", label: "Defender 90" },
  { value: "defender-110", label: "Defender 110" },
  { value: "defender-130", label: "Defender 130" },
  { value: "defender-td5", label: "Defender Td5" },
  { value: "defender-300tdi", label: "Defender 300Tdi" },
  { value: "defender-puma", label: "Defender Puma (TDCi)" },
  { value: "defender-v8", label: "Defender V8" },
  { value: "defender-new", label: "New Defender (2020+)" },
]

const modelDescriptions: Record<string, { value: string; label: string }[]> = {
  defender: defenderModels,
  discovery: [
    { value: "discovery-1", label: "Discovery 1 (1990–1998)" },
    { value: "discovery-2", label: "Discovery 2 (1999–2004)" },
    { value: "discovery-3-lr3", label: "Discovery 3 / LR3 (2005–2009)" },
    { value: "discovery-4-lr4", label: "Discovery 4 / LR4 (2010–2016)" },
    { value: "discovery-5", label: "Discovery 5 (2017+)" },
  ],
  "discovery-sport": [
    { value: "discovery-sport-gen1", label: "Discovery Sport Gen 1 (2015–2019)" },
    { value: "discovery-sport-gen2", label: "Discovery Sport Gen 2 (2020+)" },
  ],
  "range-rover": [
    { value: "range-rover-classic", label: "Range Rover Classic (1970–1996)" },
    { value: "range-rover-p38", label: "Range Rover P38 (1994–2002)" },
    { value: "range-rover-l322", label: "Range Rover L322 (2002–2012)" },
    { value: "range-rover-l405", label: "Range Rover L405 (2012–2021)" },
    { value: "range-rover-l460", label: "Range Rover L460 (2022+)" },
  ],
  "range-rover-sport": [
    { value: "range-rover-sport-l320", label: "Range Rover Sport L320 (2005–2013)" },
    { value: "range-rover-sport-l494", label: "Range Rover Sport L494 (2013–2022)" },
    { value: "range-rover-sport-l461", label: "Range Rover Sport L461 (2023+)" },
  ],
  "range-rover-evoque": [
    { value: "evoque-gen1", label: "Evoque Gen 1 (2011–2018)" },
    { value: "evoque-gen2", label: "Evoque Gen 2 (2019+)" },
  ],
  "range-rover-velar": [
    { value: "velar-l560", label: "Velar L560 (2017+)" },
  ],
  freelander: [
    { value: "freelander-1", label: "Freelander 1 (1997–2006)" },
    { value: "freelander-2", label: "Freelander 2 (2007–2014)" },
  ],
  other: [
    { value: "santana", label: "Santana" },
    { value: "custom", label: "Custom Build / Other" },
  ],
}

const engineSizes = [
  { value: "2.0", label: "2.0L" },
  { value: "2.2", label: "2.2L" },
  { value: "2.4", label: "2.4L" },
  { value: "2.5", label: "2.5L" },
  { value: "3.0", label: "3.0L" },
  { value: "3.2", label: "3.2L" },
  { value: "3.9", label: "3.9L" },
  { value: "4.0", label: "4.0L" },
  { value: "4.4", label: "4.4L" },
  { value: "4.6", label: "4.6L" },
  { value: "5.0", label: "5.0L" },
  { value: "other", label: "Other" },
]

const modelYears = {
  defender: Array.from({ length: 2025 - 1948 + 1 }, (_, i) => (2025 - i).toString()),
  discovery: Array.from({ length: 2025 - 1989 + 1 }, (_, i) => (2025 - i).toString()),
  "discovery-sport": Array.from({ length: 2025 - 2014 + 1 }, (_, i) => (2025 - i).toString()),
  "range-rover": Array.from({ length: 2025 - 1970 + 1 }, (_, i) => (2025 - i).toString()),
  "range-rover-sport": Array.from({ length: 2025 - 2005 + 1 }, (_, i) => (2025 - i).toString()),
  "range-rover-evoque": Array.from({ length: 2025 - 2011 + 1 }, (_, i) => (2025 - i).toString()),
  "range-rover-velar": Array.from({ length: 2025 - 2017 + 1 }, (_, i) => (2025 - i).toString()),
  freelander: Array.from({ length: 2025 - 1997 + 1 }, (_, i) => (2025 - i).toString()),
  other: Array.from({ length: 2025 - 1948 + 1 }, (_, i) => (2025 - i).toString()),
}

interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  emergencyContact: string
  emergencyPhone: string

  vehicleModel: string
  vehicleYear: string
  modelDescription: string
  engineSize?: string
  modifications: string

  accommodationType: string
  dietaryRestrictions: string
  medicalConditions: string
  previousParticipation: boolean
  hearAboutUs: string

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
    engineSize: "",
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

  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (formData.vehicleModel) {
      const modelKey = formData.vehicleModel.toLowerCase()
      const years = modelYears[modelKey as keyof typeof modelYears] || modelYears.other
      setAvailableYears(years)
    }
  }, [formData.vehicleModel])

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateRegistrationNumber = () => {
    const prefix = "LRF2025"
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
    return `${prefix}-${randomNum}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.termsAccepted || !formData.insuranceConfirmed || !formData.safetyAcknowledged || !formData.mediaConsent) {
      toast({
        title: "Please accept all required terms",
        description: "You must agree to all terms and conditions before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const regNumber = generateRegistrationNumber()
      setRegistrationNumber(regNumber)
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, registrationNumber: regNumber }),
      })
      if (response.ok) {
        setIsSubmitted(true)
        toast({ title: "Registration Successful!", description: "Your vehicle has been registered." })
      } else if (response.status === 409) {
        let errMsg = "This email is already registered for the festival"
        try {
          const data = await response.json()
          if (data?.error) errMsg = data.error
        } catch {}
        toast({ title: "Already Registered", description: errMsg, variant: "destructive" })
      } else {
        throw new Error("Registration failed")
      }
    } catch {
      toast({ title: "Registration Failed", description: "Please try again later.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 mx-auto mb-4 flex items-center justify-center text-4xl text-primary">✓</div>
          <h3 className="text-2xl font-bold mb-2">Registration Successful!</h3>
          <p className="mb-4 text-muted-foreground">
            Your registration number is: <span className="font-bold text-primary">{registrationNumber}</span>
          </p>
          <Button onClick={() => setIsSubmitted(false)} variant="outline">
            Register Another Vehicle
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "firstName", label: "First Name" },
                { id: "lastName", label: "Last Name" },
                { id: "email", label: "Email Address", type: "email" },
                { id: "phone", label: "Phone Number", type: "tel" },
                { id: "address", label: "Address", full: true },
                { id: "city", label: "City" },
              ].map((f) => (
                <div key={f.id} className={`space-y-2 ${f.full ? "md:col-span-2" : ""}`}>
                  <Label htmlFor={f.id}>{f.label} <span className="text-destructive">*</span></Label>
                  <Input
                    id={f.id}
                    type={f.type || "text"}
                    value={(formData as any)[f.id]}
                    onChange={(e) => handleInputChange(f.id as keyof RegistrationData, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Model */}
              <div className="space-y-2">
                <Label>Land Rover Model <span className="text-destructive">*</span></Label>
                <Select value={formData.vehicleModel} onValueChange={(v) => { handleInputChange("vehicleModel", v); handleInputChange("modelDescription", "") }}>
                  <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
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

              {/* Year */}
              <div className="space-y-2">
                <Label>Year <span className="text-destructive">*</span></Label>
                <Select value={formData.vehicleYear} onValueChange={(v) => handleInputChange("vehicleYear", v)}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Description */}
              <div className="space-y-2">
                <Label>Model Description <span className="text-destructive">*</span></Label>
                <Select value={formData.modelDescription} onValueChange={(v) => handleInputChange("modelDescription", v)}>
                  <SelectTrigger><SelectValue placeholder="Select description" /></SelectTrigger>
                  <SelectContent>
                    {(modelDescriptions[formData.vehicleModel] || modelDescriptions.other).map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.vehicleModel === "defender" && (
                  <p className="text-sm text-muted-foreground">Includes Series I, Series II, Series IIA, and Series III.</p>
                )}
              </div>

              {/* Engine Size (visible for all models) */}
              <div className="space-y-2">
                <Label>Engine Size <span className="text-destructive">*</span></Label>
                <Select value={formData.engineSize} onValueChange={(v) => handleInputChange("engineSize", v)}>
                  <SelectTrigger><SelectValue placeholder="Select engine size" /></SelectTrigger>
                  <SelectContent>
                    {engineSizes.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Modifications */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="modifications">Vehicle Modifications</Label>
                <Textarea
                  id="modifications"
                  placeholder="Describe any modifications to your vehicle..."
                  value={formData.modifications}
                  onChange={(e) => handleInputChange("modifications", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Terms and Conditions</h3>
            {[
              { id: "termsAccepted", text: "I accept the terms and conditions of the Land Rover Festival." },
              { id: "insuranceConfirmed", text: "I confirm my vehicle has valid insurance coverage." },
              { id: "safetyAcknowledged", text: "I acknowledge the risks and agree to follow safety guidelines." },
              { id: "mediaConsent", text: "I consent to media capture and use for public purposes." },
            ].map((item) => (
              <div key={item.id} className="flex items-start space-x-2 mb-2">
                <Checkbox
                  id={item.id}
                  checked={(formData as any)[item.id]}
                  onCheckedChange={(checked) => handleInputChange(item.id as keyof RegistrationData, checked as boolean)}
                />
                <Label htmlFor={item.id} className="text-sm leading-relaxed">{item.text} <span className="text-destructive">*</span></Label>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-3" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Complete Registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
