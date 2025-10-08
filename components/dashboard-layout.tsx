"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, Bell, Home, BarChart3, Settings, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [notifCount, setNotifCount] = useState(0)
  const [displayName, setDisplayName] = useState<string>("Land Rover Festival")
  useEffect(() => {
    let mounted = true
    const poll = async () => {
      try {
        const res = await fetch("/api/notifications").catch(() => null)
        if (res && res.ok) {
          const data = await res.json()
          if (mounted) setNotifCount(Array.isArray(data) ? data.length : (data?.count ?? 0))
        }
      } catch {}
    }
    poll()
    const id = setInterval(poll, 10000)
    return () => { mounted = false; clearInterval(id) }
  }, [])
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const applyUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setDisplayName(user.email || (user.user_metadata as any)?.name || "User")
      } else {
        setDisplayName("Land Rover Festival")
      }
    }
    applyUser()
    const { data: sub } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setDisplayName(session.user.email || (session.user.user_metadata as any)?.name || "User")
      } else {
        setDisplayName("Land Rover Festival")
      }
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])
  const initials = (displayName || "U").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/festivallogo.svg" alt="Festival Logo" className="h-8 w-auto" />
            <span className="font-semibold text-gray-900">{displayName}</span>
          </div>
          <div className="text-sm text-gray-500">
            <span>Dashboard</span> <span className="mx-1">/</span>
            <span className="capitalize">{pathname === "/dashboard" ? "Overview" : pathname.replace("/dashboard/", "")}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search workflows, logs..."
              className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifCount}</span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/support")}>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => { const supabase = getSupabaseBrowserClient(); await supabase.auth.signOut(); router.push("/") }}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 border-r border-gray-200 bg-white h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search anything..." className="pl-10 bg-gray-50 border-gray-200 text-sm" />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6"
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center w-full justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
