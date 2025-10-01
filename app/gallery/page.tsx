"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Play, Users, Mountain, Trophy, Heart } from "lucide-react"
import Image from "next/image"

const galleryCategories = [
  { id: "all", label: "All Photos", icon: Camera },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "culture", label: "Culture", icon: Users },
  { id: "competition", label: "Competition", icon: Trophy },
  { id: "community", label: "Community", icon: Heart },
]

const galleryItems = [
  {
    id: 1,
    src: "/land-rover-vehicles-on-african-safari-landscape.jpg",
    alt: "Land Rover convoy crossing African savanna",
    category: "vehicles",
    title: "Safari Convoy",
    description: "Land Rover vehicles navigating the beautiful Tanzanian landscape",
    year: "2024",
  },
  {
    id: 2,
    src: "/tanzanian-cultural-celebration-with-land-rover-veh.jpg",
    alt: "Cultural celebration with traditional dancers",
    category: "culture",
    title: "Cultural Celebration",
    description: "Traditional Tanzanian dancers welcoming festival participants",
    year: "2024",
  },
  {
    id: 3,
    src: "/land-rover-convoy-in-african-wilderness.jpg",
    alt: "Land Rover convoy in wilderness",
    category: "adventure",
    title: "Wilderness Adventure",
    description: "Exploring remote areas of the Serengeti region",
    year: "2024",
  },
  {
    id: 4,
    src: "/land-rover-festival-participants-celebrating.jpg",
    alt: "Festival participants celebrating",
    category: "community",
    title: "Community Spirit",
    description: "Participants celebrating after a successful day of adventure",
    year: "2024",
  },
  {
    id: 5,
    src: "/placeholder.svg?height=400&width=600&text=Land+Rover+Competition",
    alt: "Land Rover competition event",
    category: "competition",
    title: "Skills Challenge",
    description: "Participants competing in technical driving challenges",
    year: "2024",
  },
  {
    id: 6,
    src: "/placeholder.svg?height=400&width=600&text=Defender+Classic",
    alt: "Classic Land Rover Defender",
    category: "vehicles",
    title: "Classic Defender",
    description: "Beautifully restored classic Defender at the festival",
    year: "2024",
  },
  {
    id: 7,
    src: "/placeholder.svg?height=400&width=600&text=Sunset+Camp",
    alt: "Sunset at festival camp",
    category: "adventure",
    title: "Sunset Camp",
    description: "Beautiful sunset over the festival campsite",
    year: "2024",
  },
  {
    id: 8,
    src: "/placeholder.svg?height=400&width=600&text=Local+Artisans",
    alt: "Local artisans showcasing crafts",
    category: "culture",
    title: "Local Artisans",
    description: "Talented local artisans displaying traditional crafts",
    year: "2024",
  },
  {
    id: 9,
    src: "/placeholder.svg?height=400&width=600&text=Trophy+Ceremony",
    alt: "Trophy presentation ceremony",
    category: "competition",
    title: "Trophy Ceremony",
    description: "Winners receiving their awards at the closing ceremony",
    year: "2024",
  },
  {
    id: 10,
    src: "/placeholder.svg?height=400&width=600&text=Group+Photo",
    alt: "Festival group photo",
    category: "community",
    title: "Festival Family",
    description: "All participants gathered for the traditional group photo",
    year: "2024",
  },
  {
    id: 11,
    src: "/placeholder.svg?height=400&width=600&text=Range+Rover+Sport",
    alt: "Range Rover Sport in action",
    category: "vehicles",
    title: "Range Rover Sport",
    description: "Modern Range Rover Sport tackling challenging terrain",
    year: "2024",
  },
  {
    id: 12,
    src: "/placeholder.svg?height=400&width=600&text=River+Crossing",
    alt: "Land Rover crossing river",
    category: "adventure",
    title: "River Crossing",
    description: "Exciting river crossing during the adventure route",
    year: "2024",
  },
]

import { Car } from "lucide-react"

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedImage, setSelectedImage] = useState<(typeof galleryItems)[0] | null>(null)

  const filteredItems = galleryItems.filter((item) => selectedCategory === "all" || item.category === selectedCategory)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200&text=Gallery+Hero')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Festival <span className="text-gradient">Gallery</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-4xl mx-auto leading-relaxed">
              Relive the excitement and adventure of the Land Rover Festival Tanzania. Browse through our collection of
              memorable moments from past events.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Stats */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Photos Captured</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">300+</div>
              <div className="text-muted-foreground">Participants</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Land Rover Models</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">3</div>
              <div className="text-muted-foreground">Days of Adventure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Filters */}
      <section className="py-8 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {galleryCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{category.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {selectedCategory === "all"
                ? "All Festival Moments"
                : `${galleryCategories.find((cat) => cat.id === selectedCategory)?.label} Gallery`}
            </h2>
            <p className="text-lg text-muted-foreground">
              Showing {filteredItems.length} {filteredItems.length === 1 ? "photo" : "photos"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <Card className="group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={item.src || "/placeholder.svg"}
                          alt={item.alt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-background/80 text-foreground">
                            {item.year}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge
                            variant="outline"
                            className="bg-background/80 border-primary/50 text-primary capitalize"
                          >
                            {item.category}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-primary/90 rounded-full p-3">
                            <Camera className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0">
                  <div className="relative">
                    <div className="aspect-video relative">
                      <Image src={item.src || "/placeholder.svg"} alt={item.alt} fill className="object-cover" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">{item.title}</h3>
                          <p className="text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant="secondary">{item.year}</Badge>
                          <Badge variant="outline" className="capitalize">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No photos found</h3>
              <p className="text-muted-foreground">Try selecting a different category to view more photos.</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Festival Highlights</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Watch the best moments from our previous festival in this exciting highlight reel.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full p-6 mb-4 inline-block">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Festival 2024 Highlights</h3>
                    <p className="text-muted-foreground mb-4">Experience the adventure in motion</p>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">Create Your Own Memories</h2>
          <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed">
            Join us for the 2025 festival and become part of our growing gallery of adventure and community spirit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <a href="/register">Register for 2025</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
