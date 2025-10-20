"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tent, Hotel, MapPin } from "lucide-react"

export default function AccommodationsPage() {
  const options = [
    {
      id: "camping",
      name: "On‑Site Camping",
      description: "Bring your tent and camp on the festival grounds",
      details: ["Dedicated camping area", "24/7 security", "Restrooms & showers", "Community bonfire"],
      icon: Tent,
      badge: "Most Popular",
    },
    {
      id: "hotel-partner",
      name: "Partner Hotels",
      description: "Comfortable hotel stays with festival shuttle service",
      details: ["Discounted rates", "Breakfast included (selected)", "Daily shuttle", "Double or twin rooms"],
      icon: Hotel,
      badge: "Comfort",
    },
    {
      id: "self-arranged",
      name: "Self‑Arranged",
      description: "Choose your own stay and join activities on site",
      details: ["Flexible schedule", "Recommended Iringa town options", "Parking near venue"],
      icon: MapPin,
      badge: "Flexible",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-2 text-primary">
          <Tent className="w-5 h-5" />
          <span className="text-sm font-medium">Accommodations</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Accommodation Options</h1>
        <p className="text-muted-foreground mt-2">Choose the stay that fits your festival experience</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => (
          <Card key={opt.id} className="border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <opt.icon className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>{opt.name}</CardTitle>
                    <CardDescription className="mt-1">{opt.description}</CardDescription>
                  </div>
                </div>
                {opt.badge && (
                  <Badge variant="secondary" className="text-xs">{opt.badge}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
                {opt.details.map((d, i) => (<li key={i}>{d}</li>))}
              </ul>
              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href={{ pathname: "/register", query: { accommodation: opt.id } }}>Select {opt.name} & Register</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">Accommodation choice is selectable inside the registration form.</p>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/register">Go to Registration</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}