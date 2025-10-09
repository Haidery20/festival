import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ConditionalNavigation, ConditionalMain, ConditionalGlobal } from "@/components/conditional-global"
import "./globals.css"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Land Rover Festival Tanzania 2025",
  description:
    "Join the ultimate Land Rover adventure in Tanzania. Experience off-road driving and cultural celebrations.",
  generator: "v0.app",
  openGraph: {
    images: ["/festivallogo.svg"],
  },
  }
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`}>
        <ConditionalNavigation />
        <ConditionalMain>
          <Suspense>{children}</Suspense>
        </ConditionalMain>
        <ConditionalGlobal />
        <Toaster />
      </body>
    </html>
  )
}
