import { ContactForm } from "@/components/contact-form"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?key=contact-hero')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              <span className="text-gradient">Get in Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Have questions about the festival? Need assistance with registration? We're here to help make your Land
              Rover adventure unforgettable.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Send Us a Message</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Fill out the form below and we'll get back to you within 24 hours. For urgent matters, please call us
                directly.
              </p>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Reach out to us through any of these channels. Our team is ready to assist you with all your
                  festival-related inquiries.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Email</h3>
                        <p className="text-muted-foreground">info@landroverfestival.tz</p>
                        <p className="text-sm text-muted-foreground mt-1">General inquiries and registration support</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                        <p className="text-muted-foreground">+255 123 456 789</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Available Monday - Friday, 8:00 AM - 6:00 PM EAT
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Office Location</h3>
                        <p className="text-muted-foreground">
                          123 Safari Drive
                          <br />
                          Dar es Salaam, Tanzania
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Visit us for in-person consultations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                        <div className="text-muted-foreground space-y-1">
                          <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                          <p>Saturday: 9:00 AM - 4:00 PM</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Quick answers to common questions about the Land Rover Festival Tanzania.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <MessageSquare className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What Land Rover models can participate?</h3>
                    <p className="text-muted-foreground">
                      All Land Rover models are welcome, from classic Defenders to modern Discovery and Range Rover
                      vehicles. We have categories for different vehicle types and modifications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <MessageSquare className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Do I need special insurance for the event?</h3>
                    <p className="text-muted-foreground">
                      Yes, comprehensive insurance coverage is required for all participating vehicles. We can provide
                      recommendations for specialized off-road event insurance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <MessageSquare className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Are accommodation and meals included?</h3>
                    <p className="text-muted-foreground">
                      The festival offers various accommodation packages from camping to luxury lodges. Meals during
                      official events are included, with options for dietary restrictions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <MessageSquare className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Can international participants join?</h3>
                    <p className="text-muted-foreground">
                      We welcome participants from across East Africa and beyond. We can assist with visa requirements
                      and vehicle import procedures.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
