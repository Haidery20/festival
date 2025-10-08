"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, MapPin, Users, Trophy, Mountain, Compass, Camera, Shield } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { PartnersCarousel } from "@/components/partners-carousel"
import { HeroCarousel } from "@/components/hero-carousel"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  // If a Supabase auth fragment is present, forward to /login to handle session + password setup
  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash || ""
    if (hash && /access_token=/.test(hash)) {
      try {
        // Preserve the hash while changing path to /login
        const next = `/login${hash}`
        router.replace(next)
      } catch {
        // Fallback: hard redirect
        window.location.href = `/login${hash}`
      }
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Replace static background with slider */}
        <HeroCarousel />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6">
              <span className="text-gradient">Land Rover Festival</span>
              <br />
              <span className="text-primary-foreground">Tanzania 2025 - Iringa</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the ultimate off-road adventure combined with Tanzania's rich cultural heritage. Join
              enthusiasts from across East Africa for an unforgettable journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3">
                <Link href="/register">Register Your Vehicle</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 text-primary-foreground/90">
                <Calendar className="h-6 w-6 text-accent" />
                <div className="text-left">
                  <p className="font-semibold">November 28-30, 2025</p>
                  <p className="text-sm text-primary-foreground/70">3 Days of Adventure</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 text-primary-foreground/90">
                <MapPin className="h-6 w-6 text-accent" />
                <div className="text-left">
                  <p className="font-semibold">Iringa Region</p>
                  <p className="text-sm text-primary-foreground/70">Iringa, Tanzania</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 text-primary-foreground/90">
                <Users className="h-6 w-6 text-accent" />
                <div className="text-left">
                  <p className="font-semibold">500+ Participants</p>
                  <p className="text-sm text-primary-foreground/70">Expected Attendance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Festival Overview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Makes Our Festival Special</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Land Rover Festival Tanzania brings together automotive passion and cultural celebration, creating an
              experience that goes beyond just off-road driving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <Mountain className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Off-Road Adventures</h3>
                <p className="text-muted-foreground">
                  Navigate challenging terrains across Tanzania's diverse landscapes with expert guides.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <Compass className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Cultural Immersion</h3>
                <p className="text-muted-foreground">
                  Experience authentic Tanzanian culture through music, dance, and traditional ceremonies.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Competitions</h3>
                <p className="text-muted-foreground">
                  Participate in skill challenges and win prizes in various Land Rover categories.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Photography</h3>
                <p className="text-muted-foreground">
                  Capture stunning moments with professional photography workshops and scenic routes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Importance Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why This Festival Matters</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Community Building</h3>
                    <p className="text-muted-foreground">
                      Strengthening bonds within the Land Rover community across East Africa and promoting responsible
                      off-road driving practices.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Cultural Exchange</h3>
                    <p className="text-muted-foreground">
                      Celebrating Tanzania's rich heritage while bringing together diverse cultures through shared
                      automotive passion and adventure.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Economic Impact</h3>
                    <p className="text-muted-foreground">
                      Supporting local communities and businesses while showcasing Tanzania as a premier destination for
                      automotive tourism.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-[url('/fest1.jpeg')] bg-cover bg-center rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Partners</h2>
            <p className="text-muted-foreground">
              We’re proud to collaborate with organizations supporting the festival.
            </p>
          </div>

          <PartnersCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">Ready for the Adventure?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed">
            Join hundreds of Land Rover enthusiasts for an unforgettable experience in Tanzania. Register now to secure
            your spot at this year's festival.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/register">Register Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              <Link href="/gallery">View Gallery</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
