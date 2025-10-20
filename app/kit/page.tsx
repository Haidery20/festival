"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Gift, Shirt, Star } from "lucide-react"

export default function FestivalKitPage() {
  const kits = [
    {
      id: "basic",
      name: "Basic Pack",
      description: "Festival T‑shirt + Badge + Stickers",
      details: ["Soft cotton T‑shirt", "Official participant badge", "Sticker set"],
      badge: "Popular",
    },
    {
      id: "premium",
      name: "Premium Pack",
      description: "T‑shirt + Badge + Cap + Stickers",
      details: ["Premium T‑shirt", "Cap", "Badge", "Stickers"],
      badge: "Recommended",
    },
    {
      id: "vip",
      name: "VIP Pack",
      description: "Premium Jacket + T‑shirt + Badge + Cap + Stickers",
      details: ["Festival jacket", "Premium T‑shirt", "Cap", "Badge", "Stickers"],
      badge: "Limited",
    },
  ]

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-2 text-primary">
          <Gift className="w-5 h-5" />
          <span className="text-sm font-medium">Festival Kit</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Choose Your Festival Kit</h1>
        <p className="text-muted-foreground mt-2">Get your official gear for the Land Rover Festival Tanzania 2025</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <Card key={kit.id} className="border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{kit.name}</CardTitle>
                  <CardDescription className="mt-1">{kit.description}</CardDescription>
                </div>
                {kit.badge && (
                  <Badge variant="secondary" className="text-xs">{kit.badge}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
                {kit.details.map((d, i) => (<li key={i}>{d}</li>))}
              </ul>
              <div className="mt-4 p-3 rounded-md bg-muted/40 border border-border/50">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shirt className="w-4 h-4" />
                  Available Sizes
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizes.map((s) => (
                    <span key={s} className="inline-flex items-center px-2 py-1 rounded border text-xs bg-background">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href={{ pathname: "/register", query: { kit: kit.id } }}>Select {kit.name} & Register</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-2">
          <Star className="w-4 h-4" />
          <span className="text-sm">Note</span>
        </div>
        <p className="text-muted-foreground">You can also choose your kit package inside the registration form.</p>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/register">Go to Registration</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}