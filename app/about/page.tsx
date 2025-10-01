import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Target, Heart, Globe, Award, Handshake } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/land-rover-convoy-in-african-wilderness.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              About the <span className="text-gradient">Festival</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-4xl mx-auto leading-relaxed">
              Discover the story behind Tanzania's premier Land Rover gathering and why it has become the most
              anticipated automotive and cultural event in East Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Festival Story */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The Land Rover Festival Tanzania began as a small gathering of passionate off-road enthusiasts in
                  2023. What started with just 50 vehicles has grown into East Africa's largest celebration of Land
                  Rover heritage and adventure.
                </p>
                <p>
                  Our festival uniquely combines the thrill of off-road exploration with Tanzania's rich cultural
                  tapestry. We believe that adventure is best shared, and our event creates lasting connections between
                  people from diverse backgrounds united by their love for Land Rover vehicles.
                </p>
                <p>
                  Last year's inaugural festival welcomed over 300 participants from across Tanzania, Kenya, Uganda, and
                  beyond. The success of our first event has inspired us to create an even more spectacular experience
                  for 2025.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-[url('/land-rover-festival-participants-celebrating.jpg')] bg-cover bg-center rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Mission & Vision</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're driven by a passion for adventure and a commitment to celebrating both automotive excellence and
              cultural diversity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/50">
              <CardContent className="p-8">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To create the premier Land Rover experience in East Africa by combining thrilling off-road adventures
                  with authentic cultural celebrations, fostering community connections and promoting responsible
                  tourism in Tanzania.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <Heart className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To establish Tanzania as the ultimate destination for Land Rover enthusiasts worldwide, creating
                  lasting partnerships between international visitors and local communities while preserving our natural
                  heritage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Festival Importance */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why This Festival Matters</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our festival creates positive impact across multiple dimensions, from community building to economic
              development and cultural preservation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Community Building</h3>
                <p className="text-muted-foreground">
                  Strengthening the Land Rover community across East Africa while promoting responsible off-road
                  practices and environmental stewardship.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Cultural Exchange</h3>
                <p className="text-muted-foreground">
                  Celebrating Tanzania's rich heritage through music, dance, and traditional ceremonies while fostering
                  international friendships.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Economic Impact</h3>
                <p className="text-muted-foreground">
                  Supporting local businesses, creating employment opportunities, and showcasing Tanzania as a premier
                  automotive tourism destination.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Our Partners</h2>
            <p className="text-lg text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
              We're proud to collaborate with esteemed organizations that share our vision for adventure and cultural
              celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="p-8 text-center">
                <img src="/gov.png" className="h-32 w-24 text-accent mx-auto mb-4"/>
                <h3 className="text-2xl font-bold text-primary-foreground mb-3">Government of Tanzania</h3>
                <p className="text-primary-foreground/80">
                  Official support from the Tanzania Tourism Board and Ministry of Natural Resources, ensuring our
                  festival meets the highest standards of safety and cultural sensitivity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="p-8 text-center">
                <img src="/lrct.svg" className="h-32 w-24 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary-foreground mb-3">Land Rover Club Tanzania</h3>
                <p className="text-primary-foreground/80">
                  Partnership with the official Land Rover Club Tanzania, bringing together the most experienced
                  off-road enthusiasts and technical expertise in the region.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Be Part of Our Story</h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Join us in creating unforgettable memories and building lasting connections. Register now for the Land Rover
            Festival Tanzania 2025.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link href="/register">Register Your Vehicle</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
