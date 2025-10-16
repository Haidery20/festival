import Link from "next/link"
import { Car, Mountain, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center space-x-1">
                <img src="/festivallogo.svg" alt="Land Rover Festival" className="h-64 w-auto block shrink-0" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">Land Rover Festival</span>
               <span className="text-sm text-primary-foreground/80">Tanzania 2025</span>
               <span className="text-sm text-primary-foreground/80">Iringa, Tanzania • 2025</span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Join us for the ultimate Land Rover adventure in Tanzania. Experience the thrill of off-road driving
              combined with rich cultural celebrations in the heart of East Africa.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-primary-foreground/60">Partners:</span>
              <span className="text-accent">Government of Tanzania</span>
              <span className="text-accent">Land Rover Club Tanzania</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  About Festival
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-primary-foreground/80 text-sm">info@landroverfestival.tz</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-primary-foreground/80 text-sm">+255 754 979 018 & +255 763 652 641</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-primary-foreground/80 text-sm">Dar es Salaam, Tanzania</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-primary-foreground/80 text-sm">Iringa Region, Tanzania</span>
             </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2025 Land Rover Festival Tanzania. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
