"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Invite/password setup mode
  const [inviteMode, setInviteMode] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [inviteInfo, setInviteInfo] = useState<{ type?: string; error?: string } | null>(null)

  // Handle access_token fragment from Supabase invite/magic links
  useEffect(() => {
    // Only run client-side
    if (typeof window === "undefined") return
    const hash = window.location.hash || ""
    if (!hash) return

    const params = new URLSearchParams(hash.replace(/^#/, ""))
    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")
    const type = params.get("type") || undefined
    const error_code = params.get("error_code") || undefined
    const error_description = params.get("error_description") || undefined

    // If there is an error from Supabase (e.g., otp_expired), show it
    if (error_code || error_description) {
      setInviteInfo({ type, error: error_description || error_code || "Link error" })
      // Clean the URL hash to avoid re-processing
      try {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
      } catch {}
      return
    }

    // If we have tokens, establish a session
    if (access_token && refresh_token) {
      ;(async () => {
        try {
          const supabase = getSupabaseBrowserClient()
          const { data, error: setErr } = await supabase.auth.setSession({ access_token, refresh_token })
          if (setErr) {
            setError(setErr.message || "Failed to set session from invite link")
            return
          }

          // Clean the URL hash to avoid leaking tokens
          try {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
          } catch {}

          // Enter invite password setup mode
          setInviteMode(true)
        } catch (e: any) {
          setError(e?.message || "Failed to process invitation link")
        }
      })()
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message || "Invalid credentials")
      } else if (data.session) {
        router.push("/dashboard")
      } else {
        setError("Login failed. No session returned.")
      }
    } catch (err: any) {
      const message = err?.message || "Failed to login. Please check Supabase configuration and try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function onSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!newPassword || newPassword.length < 8) {
        setError("Password must be at least 8 characters long")
        return
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      const supabase = getSupabaseBrowserClient()
      const { data, error: updErr } = await supabase.auth.updateUser({ password: newPassword })
      if (updErr) {
        setError(updErr.message || "Failed to set password")
        return
      }

      // Optional: mark user metadata as activated
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (user) {
          await supabase.auth.updateUser({
            data: {
              status: "active",
            },
          } as any)
        }
      } catch {}

      // After password setup, go to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      const message = err?.message || "Failed to set password. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{inviteMode ? "Set your password" : "Login"}</CardTitle>
        </CardHeader>
        <CardContent>
          {inviteInfo?.error && (
            <div className="mb-4 text-sm text-red-600">{inviteInfo.error}</div>
          )}
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          {inviteMode ? (
            <form onSubmit={onSetPassword} className="space-y-4">
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Set password"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}