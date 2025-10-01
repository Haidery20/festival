import { RegistrationForm } from "@/components/registration-form"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, FileText, Mail, Shield } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?key=register-hero')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              <span className="text-gradient">Register</span> Your Vehicle
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-4xl mx-auto leading-relaxed">
              Secure your spot at Tanzania's premier Land Rover festival. Complete the registration form below and
              receive your confirmation documents instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Registration Process */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Registration Process</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Follow these simple steps to register your Land Rover for the festival.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Fill Form</h3>
                <p className="text-muted-foreground text-sm">
                  Complete the registration form with your vehicle and personal details.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Download PDF</h3>
                <p className="text-muted-foreground text-sm">
                  Receive your registration confirmation as a downloadable PDF document.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Email Confirmation</h3>
                <p className="text-muted-foreground text-sm">
                  Get instant email confirmation with all festival details and next steps.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">You're Set!</h3>
                <p className="text-muted-foreground text-sm">
                  Your registration is complete. Prepare for an amazing Land Rover adventure!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Vehicle Registration Form</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Please provide accurate information for your vehicle registration. All fields marked with * are required.
            </p>
          </div>

          <RegistrationForm />
        </div>
      </section>

      {/* Important Information */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Important Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <Shield className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Registration Requirements</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Valid driver's license and vehicle registration</li>
                  <li>• Comprehensive insurance coverage</li>
                  <li>• Vehicle safety inspection certificate</li>
                  <li>• Emergency contact information</li>
                  <li>• Medical information (if applicable)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <FileText className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">What You'll Receive</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Registration confirmation PDF</li>
                  <li>• Festival schedule and route maps</li>
                  <li>• Accommodation and meal information</li>
                  <li>• Emergency contact numbers</li>
                  <li>• Packing list and preparation guide</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
