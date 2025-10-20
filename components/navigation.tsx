"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Car, Mountain } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const showGallery = false

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <img src="/festivallogo.svg" alt="Land Rover Festival Tanzania" className="h-8 w-8" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">Land Rover</span>
              <span className="text-xs text-muted-foreground -mt-1">Festival Tanzania</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            {showGallery && (
              <Link href="/gallery" className="text-foreground hover:text-primary transition-colors">
                Gallery
              </Link>
            )}
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/register">Register Now</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              <Link
                href="/"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              {showGallery && (
                <Link
                  href="/gallery"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Gallery
                </Link>
              )}
              <Link
                href="/contact"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="px-3 py-2">
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    Register Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
