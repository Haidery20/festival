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

// Apparel sizes S to XXXL
const apparelSizes = ["S", "M", "L", "XL", "XXL", "XXXL"]
// Add Ruaha pricing constants
const RUAHA_RATES = {
  entrance: { adult: 5900, child: 2360, vehicle: 41000 },
  lodging: {
    bandas: 17700,
    hostel: 23600,
    cottage_single_with_living: 41300,
    cottage_single_no_living: 29000,
    cottage_family: 59000,
    public_camping_no_tent: 5900,
  },
}
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
  kitSelection: string
  kitPrice: string
  kitVariant: string
  kitTshirtSize: string
  kitTshirtSize1: string
  kitTshirtSize2: string
  kitShirtSize: string
  // New accommodation details
  accDurationOption: string
  accStartDate: string
  accEndDate: string
  accNights: string
  accAdults: string
  accChildren: string
  accGearOption: string
  accTentPrice: string
  accAdditionalMattressCount: string
  ruahaTripType: string
  ruahaStartDate: string
  ruahaEndDate: string
  ruahaVehicles: string
  ruahaLodgingType: string
  ruahaUnits: string
  ruahaNights: string

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
    kitSelection: "",
    kitPrice: "",
    kitVariant: "",
    kitTshirtSize: "",
    kitTshirtSize1: "",
    kitTshirtSize2: "",
    kitShirtSize: "",
    // New accommodation details
    accDurationOption: "",
    accStartDate: "",
    accEndDate: "",
    accNights: "",
    accAdults: "",
    accChildren: "",
    accGearOption: "",
    accTentPrice: "",
    accAdditionalMattressCount: "",
    ruahaTripType: "",
    ruahaStartDate: "",
    ruahaEndDate: "",
    ruahaVehicles: "",
    ruahaLodgingType: "",
    ruahaUnits: "",
    ruahaNights: "",
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
  const [isReserving, setIsReserving] = useState(false)

  useEffect(() => {
    if (formData.vehicleModel) {
      const modelKey = formData.vehicleModel.toLowerCase()
      const years = modelYears[modelKey as keyof typeof modelYears] || modelYears.other
      setAvailableYears(years)
    }
  }, [formData.vehicleModel])

  // Prefill kit & accommodation from URL params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const acc = params.get("accommodation")
      const kit = params.get("kit")
      if (acc) {
        handleInputChange("accommodationType", acc)
      }
      if (kit) {
        const kitMap: Record<string, string> = {
          basic: "Basic Pack",
          premium: "Premium Pack",
          vip: "VIP Pack",
        }
        const priceMap: Record<string, string> = {
          basic: "30000",
          premium: "50000",
          vip: "50000",
        }
        handleInputChange("kitSelection", kitMap[kit] || kit)
        if (priceMap[kit]) handleInputChange("kitPrice", priceMap[kit])
      }
    } catch {}
  }, [])

  // Compute Ruaha days/nights and pricing preview
  const parseDate = (s: string) => (s ? new Date(`${s}T00:00:00`) : null)
  const ruahaDays = (() => {
    // Day trip counts as 1 day automatically
    if (formData.ruahaTripType === "day-trip") return 1
    const s = parseDate(formData.ruahaStartDate)
    const e = parseDate(formData.ruahaEndDate)
    if (!s || !e || e < s) return 0
    return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1
  })()
  const ruahaNightsComputed = Math.max(ruahaDays - 1, 0)

  const adultsCount = Number(formData.accAdults || 0)
  const childrenCount = Number(formData.accChildren || 0)
  const vehiclesCount = Number(formData.ruahaVehicles || 1)

  const entranceAdultTotal = adultsCount * ruahaDays * RUAHA_RATES.entrance.adult
  const entranceChildTotal = childrenCount * ruahaDays * RUAHA_RATES.entrance.child
  const entranceVehicleTotal = vehiclesCount * RUAHA_RATES.entrance.vehicle

  const lodgingRate = (RUAHA_RATES.lodging as any)[formData.ruahaLodgingType] || 0
  const lodgingUnits = Number(formData.ruahaUnits || 0)
  const lodgingNights = formData.ruahaTripType === "camping" ? ruahaNightsComputed : 0
  const lodgingTotal = lodgingUnits * lodgingNights * lodgingRate

  const gearVendorTotal = formData.accGearOption === "ours" && formData.ruahaTripType === "camping"
    ? Number(formData.accTentPrice || 0) + Number(formData.accAdditionalMattressCount || 0) * 10000
    : 0
  const kitTotal = Number(formData.kitPrice || 0)
  const pricingTotal = entranceAdultTotal + entranceChildTotal + entranceVehicleTotal + lodgingTotal + gearVendorTotal + kitTotal

  const pricingDetails = [
    `Entrance — Adults ${adultsCount} × ${ruahaDays} × 5,900 = ${entranceAdultTotal.toLocaleString()}`,
    `Entrance — Children ${childrenCount} × ${ruahaDays} × 2,360 = ${entranceChildTotal.toLocaleString()}`,
    `Entrance — Vehicle ${vehiclesCount} × 41,000 = ${entranceVehicleTotal.toLocaleString()}`,
    formData.ruahaTripType === "camping" && formData.ruahaLodgingType
      ? `Lodging — ${String(formData.ruahaLodgingType).replace(/_/g, " ")} ${lodgingUnits} × ${lodgingNights} × ${lodgingRate.toLocaleString()} = ${lodgingTotal.toLocaleString()}`
      : "",
    gearVendorTotal ? `Camping Gear — Vendor = ${gearVendorTotal.toLocaleString()}` : "",
    kitTotal ? `Festival Kit = ${kitTotal.toLocaleString()}` : "",
  ].filter(Boolean).join(" | ")

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

  const handleReserveAndPay = async () => {
    if (!formData.email) {
      toast({ title: "Email required", description: "Please enter your email before reserving.", variant: "destructive" })
      return
    }
    if (!formData.termsAccepted || !formData.insuranceConfirmed || !formData.safetyAcknowledged || !formData.mediaConsent) {
      toast({ title: "Please accept all required terms", description: "Agree to all terms before reserving.", variant: "destructive" })
      return
    }

    setIsReserving(true)
    try {
      const regNumber = generateRegistrationNumber()
      setRegistrationNumber(regNumber)
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: regNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          pricingTotal,
          pricingDetails,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Reservation created",
          description: `ID ${data.reservationId} — Expires ${new Date(data.expiresAt).toLocaleString()}`,
        })
      } else {
        const text = await response.text()
        toast({ title: "Reservation failed", description: text || "Please try again.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Reservation failed", description: "Network or server error.", variant: "destructive" })
    } finally {
      setIsReserving(false)
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

          {/* Festival Kit */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Festival Kit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Festival Kit Pricing */}
              <div className="space-y-2">
                <Label>Festival Kit</Label>
                <Select
                  value={formData.kitPrice}
                  onValueChange={(v) => {
                    handleInputChange("kitPrice", v)
                    handleInputChange("kitVariant", "")
                    handleInputChange("kitTshirtSize", "")
                    handleInputChange("kitTshirtSize1", "")
                    handleInputChange("kitTshirtSize2", "")
                    handleInputChange("kitShirtSize", "")
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select price option" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30000">TZS 30,000 — 1 T‑shirt</SelectItem>
                    <SelectItem value="50000">TZS 50,000 — Two T‑shirts or T‑shirt + Shirt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic selections based on price */}
              {formData.kitPrice === "30000" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>T‑shirt Size</Label>
                  <Select value={formData.kitTshirtSize} onValueChange={(v) => handleInputChange("kitTshirtSize", v)}>
                    <SelectTrigger><SelectValue placeholder="Select T‑shirt size" /></SelectTrigger>
                    <SelectContent>
                      {apparelSizes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.kitPrice === "50000" && (
                <>
                  <div className="space-y-2">
                    <Label>Package Choice</Label>
                    <Select
                      value={formData.kitVariant}
                      onValueChange={(v) => {
                        handleInputChange("kitVariant", v)
                        handleInputChange("kitTshirtSize1", "")
                        handleInputChange("kitTshirtSize2", "")
                        handleInputChange("kitShirtSize", "")
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="two-ts">Two T‑shirts</SelectItem>
                        <SelectItem value="tshirt-shirt">T‑shirt + Shirt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.kitVariant === "two-ts" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                      <div className="space-y-2">
                        <Label>T‑shirt Size #1</Label>
                        <Select value={formData.kitTshirtSize1} onValueChange={(v) => handleInputChange("kitTshirtSize1", v)}>
                          <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                          <SelectContent>
                            {apparelSizes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>T‑shirt Size #2</Label>
                        <Select value={formData.kitTshirtSize2} onValueChange={(v) => handleInputChange("kitTshirtSize2", v)}>
                          <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                          <SelectContent>
                            {apparelSizes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {formData.kitVariant === "tshirt-shirt" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                      <div className="space-y-2">
                        <Label>T‑shirt Size</Label>
                        <Select value={formData.kitTshirtSize1} onValueChange={(v) => handleInputChange("kitTshirtSize1", v)}>
                          <SelectTrigger><SelectValue placeholder="Select T‑shirt size" /></SelectTrigger>
                          <SelectContent>
                            {apparelSizes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Shirt Size</Label>
                        <Select value={formData.kitShirtSize} onValueChange={(v) => handleInputChange("kitShirtSize", v)}>
                          <SelectTrigger><SelectValue placeholder="Select shirt size" /></SelectTrigger>
                          <SelectContent>
                            {apparelSizes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </>
              )}
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

          {/* Kit & Accommodation */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Accommodation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Accommodation Type */}
              <div className="space-y-2">
                <Label>Accommodation</Label>
                <Select value={formData.accommodationType} onValueChange={(v) => {
                  handleInputChange("accommodationType", v)
                  // Reset dependent fields when accommodation changes
                  handleInputChange("accDurationOption", "")
                  handleInputChange("accStartDate", "")
                  handleInputChange("accEndDate", "")
                  handleInputChange("accNights", "")
                  handleInputChange("accAdults", "")
                  handleInputChange("accChildren", "")
                  handleInputChange("accGearOption", "")
                  handleInputChange("accTentPrice", "")
                  handleInputChange("accAdditionalMattressCount", "")
                }}>
                  <SelectTrigger><SelectValue placeholder="Select accommodation" /></SelectTrigger>
                  <SelectContent>
                    {/* Confirmed accommodation options */}
                    <SelectItem value="river-valley">River Valley</SelectItem>
                    <SelectItem value="self-arranged">Self‑Arranged</SelectItem>
                  </SelectContent>
                </Select>
              </div>







            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">After Festival Trip — Ruaha National Park</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trip Type</Label>
                  <Select value={formData.ruahaTripType} onValueChange={(v) => {
                    handleInputChange("ruahaTripType", v)
                    if (v !== "camping") {
                      handleInputChange("ruahaStartDate", "")
                      handleInputChange("ruahaEndDate", "")
                      handleInputChange("accGearOption", "")
                      handleInputChange("accTentPrice", "")
                      handleInputChange("accAdditionalMattressCount", "")
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select trip type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day-trip">Day Trip</SelectItem>
                      <SelectItem value="camping">Camping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.ruahaTripType === "camping" && (
                  <>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" value={formData.ruahaStartDate} onChange={(e) => handleInputChange("ruahaStartDate", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" value={formData.ruahaEndDate} onChange={(e) => handleInputChange("ruahaEndDate", e.target.value)} />
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <Input type="number" min={0} value={formData.accAdults} onChange={(e) => handleInputChange("accAdults", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Watoto (Children)</Label>
                  <Input type="number" min={0} value={formData.accChildren} onChange={(e) => handleInputChange("accChildren", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Vehicles</Label>
                  <Input type="number" min={0} value={formData.ruahaVehicles} onChange={(e) => handleInputChange("ruahaVehicles", e.target.value)} />
                </div>
              </div>

              {formData.ruahaTripType === "camping" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Camping Gears</Label>
                    <Select value={formData.accGearOption} onValueChange={(v) => {
                      handleInputChange("accGearOption", v)
                      if (v !== "ours") {
                        handleInputChange("accTentPrice", "")
                        handleInputChange("accAdditionalMattressCount", "")
                      }
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select gear option" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Personal Gears</SelectItem>
                        <SelectItem value="ours">Vendor Gears</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.accGearOption === "ours" && (
                    <div className="space-y-2">
                      <Label>Tent Price</Label>
                      <Select value={formData.accTentPrice} onValueChange={(v) => handleInputChange("accTentPrice", v)}>
                        <SelectTrigger><SelectValue placeholder="Select tent price" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50000">TZS 50,000 — Single mattress</SelectItem>
                          <SelectItem value="30000">TZS 30,000 — Single mattress</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formData.accGearOption === "ours" && (
                    <div className="space-y-2">
                      <Label>Additional Mattress (TZS 10,000 each)</Label>
                      <Input type="number" min={0} value={formData.accAdditionalMattressCount} onChange={(e) => handleInputChange("accAdditionalMattressCount", e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {formData.ruahaTripType === "camping" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="ruahaLodgingType">Lodging Type</Label>
                    <Select value={formData.ruahaLodgingType} onValueChange={(v) => handleInputChange("ruahaLodgingType", v)}>
                      <SelectTrigger id="ruahaLodgingType"><SelectValue placeholder="Select lodging" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bandas">Bandas</SelectItem>
                        <SelectItem value="hostel">Hostel</SelectItem>
                        <SelectItem value="cottage_single_with_living">Cottage (single, with living room)</SelectItem>
                        <SelectItem value="cottage_single_no_living">Cottage (single, no living room)</SelectItem>
                        <SelectItem value="cottage_family">Cottage (family)</SelectItem>
                        <SelectItem value="public_camping_no_tent">Public Camping (no tent)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Units (rooms/tents)</Label>
                    <Input type="number" min={0} value={formData.ruahaUnits} onChange={(e) => handleInputChange("ruahaUnits", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nights</Label>
                    <Input type="number" value={String(lodgingNights)} readOnly />
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 border rounded-md">
                <h4 className="font-semibold mb-2">Pricing Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Entrance — Adults: {adultsCount} × {ruahaDays} × 5,900 = {entranceAdultTotal.toLocaleString()}</div>
                  <div>Entrance — Children: {childrenCount} × {ruahaDays} × 2,360 = {entranceChildTotal.toLocaleString()}</div>
                  <div>Entrance — Vehicle: {vehiclesCount} × 41,000 = {entranceVehicleTotal.toLocaleString()}</div>
                  {formData.ruahaTripType === "camping" && formData.ruahaLodgingType && (
                    <div>
                      Lodging — {String(formData.ruahaLodgingType).replace(/_/g, " ")}: {lodgingUnits} × {lodgingNights} × {lodgingRate.toLocaleString()} = {lodgingTotal.toLocaleString()}
                    </div>
                  )}
                  {gearVendorTotal ? (
                    <div>Camping Gear — Vendor: {gearVendorTotal.toLocaleString()}</div>
                  ) : null}
                  {kitTotal ? (
                    <div>Festival Kit: {kitTotal.toLocaleString()}</div>
                  ) : null}
                  <div className="font-semibold pt-2">Total: {pricingTotal.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {formData.accommodationType === "river-valley" && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">River Valley</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nights</Label>
                    <Select value={formData.accNights} onValueChange={(v) => handleInputChange("accNights", v)}>
                      <SelectTrigger><SelectValue placeholder="Select nights" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 night</SelectItem>
                        <SelectItem value="2">2 nights</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Adults</Label>
                    <Input type="number" min={0} value={formData.accAdults} onChange={(e) => handleInputChange("accAdults", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Watoto (Children)</Label>
                    <Input type="number" min={0} value={formData.accChildren} onChange={(e) => handleInputChange("accChildren", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicles</Label>
                    <Input type="number" min={0} value={formData.ruahaVehicles} onChange={(e) => handleInputChange("ruahaVehicles", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Camping Gears</Label>
                    <Select value={formData.accGearOption} onValueChange={(v) => {
                      handleInputChange("accGearOption", v)
                      if (v !== "ours") {
                        handleInputChange("accTentPrice", "")
                        handleInputChange("accAdditionalMattressCount", "")
                        
                      }
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select gear option" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Personal Gears</SelectItem>
                        <SelectItem value="ours">Vendor Gears</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.accGearOption === "ours" && (
                    <div className="space-y-2">
                      <Label>Tent Price</Label>
                      <Select value={formData.accTentPrice} onValueChange={(v) => handleInputChange("accTentPrice", v)}>
                        <SelectTrigger><SelectValue placeholder="Select tent price" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50000">TZS 50,000 — Single mattress</SelectItem>
                          <SelectItem value="30000">TZS 30,000 — Single mattress</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formData.accGearOption === "ours" && (
                    <div className="space-y-2">
                      <Label>Additional Mattress (TZS 10,000 each)</Label>
                      <Input type="number" min={0} value={formData.accAdditionalMattressCount} onChange={(e) => handleInputChange("accAdditionalMattressCount", e.target.value)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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

          <div className="mt-4 p-4 border rounded-md">
            <h4 className="font-semibold mb-2">Cart & Checkout</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="font-semibold">Total: TZS {pricingTotal.toLocaleString()}</div>
              <div className="text-xs">We’ll hold your reservation for 7 days.</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-3" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Complete Registration"}
              </Button>
              <Button type="button" variant="outline" className="w-full py-3" disabled={isReserving} onClick={handleReserveAndPay}>
                {isReserving ? "Reserving..." : "Reserve & Pay (7 days)"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
