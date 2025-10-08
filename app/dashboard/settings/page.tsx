"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { UserPlus, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [saving, setSaving] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notificationsEmail, setNotificationsEmail] = useState(true)
  const [notificationsSms, setNotificationsSms] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [initialEmail, setInitialEmail] = useState<string>("")
  // Admin: users management state
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<Role>("Viewer")
  const [inviting, setInviting] = useState(false)
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)
  const [roleUpdatingId, setRoleUpdatingId] = useState<number | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [adminMessage, setAdminMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminUsers")
      if (raw) {
        const parsed = JSON.parse(raw) as ManagedUser[]
        if (Array.isArray(parsed)) {
          setUsers(parsed)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("adminUsers", JSON.stringify(users))
    } catch {}
  }, [users])

  const addUser = async () => {
    const name = newUserName.trim()
    const email = newUserEmail.trim()
    if (!name || !email) return

    setInviting(true)
    setInviteMessage(null)
    setLastInviteLink(null)
    try {
      const res = await fetch("/api/auth/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role: newUserRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteMessage(data?.error || "Failed to send invite")
      } else if (data?.invited) {
        if (data?.emailSent) {
          setInviteMessage(`Invitation email sent to ${email}`)
        } else if (data?.link) {
          setInviteMessage("Invitation created. Share the link below.")
          setLastInviteLink(data.link as string)
        } else {
          setInviteMessage("Invitation created.")
        }
        // Reflect in local UI list
        const id = Date.now()
        setUsers((prev) => [...prev, { id, name, email, role: newUserRole }])
        // Reset inputs
        setNewUserName("")
        setNewUserEmail("")
        setNewUserRole("Viewer")
      } else {
        setInviteMessage("Invite could not be created")
      }
    } catch (e: any) {
      setInviteMessage(e?.message || "Unexpected error")
    } finally {
      setInviting(false)
    }
  }

  const updateUserRole = async (id: number, role: Role) => {
    const target = users.find((u) => u.id === id)
    if (!target) return
    setRoleUpdatingId(id)
    setAdminMessage(null)
    try {
      const res = await fetch("/api/auth/admin/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target.email, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAdminMessage(data?.error || "Failed to update role")
      } else {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
        setAdminMessage(`Role updated for ${target.email} → ${role}`)
      }
    } catch (e: any) {
      setAdminMessage(e?.message || "Unexpected error updating role")
    } finally {
      setRoleUpdatingId(null)
    }
  }

  const removeUser = async (id: number) => {
    const target = users.find((u) => u.id === id)
    if (!target) return
    setRemovingId(id)
    setAdminMessage(null)
    try {
      const res = await fetch("/api/auth/admin/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target.email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAdminMessage(data?.error || "Failed to remove user")
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id))
        setAdminMessage(`Removed ${target.email}`)
      }
    } catch (e: any) {
      setAdminMessage(e?.message || "Unexpected error removing user")
    } finally {
      setRemovingId(null)
    }
  }

  const initials = useMemo(() => {
    const f = firstName?.trim()?.charAt(0) || ""
    const l = lastName?.trim()?.charAt(0) || ""
    const candidate = `${f}${l}`.toUpperCase()
    return candidate || "LF"
  }, [firstName, lastName])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const meta: any = user.user_metadata || {}
          setFirstName(meta.first_name || meta.firstName || "")
          setLastName(meta.last_name || meta.lastName || "")
          setPhone(meta.phone || "")
          setTimezone(meta.timezone || "UTC")
          setEmail(user.email || "")
          setInitialEmail(user.email || "")
        }
      } catch (e: any) {
        // If Supabase is not configured, show a gentle message (optional)
        setProfileMessage(e?.message || "Unable to load profile. Please check Supabase configuration.")
      }
    }
    loadProfile()
  }, [])

  function handleSaveProfile() {
    setSaving(true)
    setProfileMessage(null);
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const fullName = `${firstName} ${lastName}`.trim()
        const { data, error } = await supabase.auth.updateUser({
          // Store fields in user_metadata
          data: {
            first_name: firstName,
            last_name: lastName,
            name: fullName,
            phone,
            timezone,
          },
          // Avoid attempting email change flow for now (requires template + confirmation)
          // Only include email if it actually changed and you want to trigger email-change
          // email: email !== initialEmail ? email : undefined,
        })
        if (error) {
          setProfileMessage(error.message || "Failed to save profile")
        } else {
          setProfileMessage("Profile updated successfully")
        }
      } catch (e: any) {
        setProfileMessage(e?.message || "Unexpected error saving profile")
      } finally {
        setSaving(false)
      }
    })()
  }

  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as "profile" | "preferences" | "security" | "admin" | null) || "profile"
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "security" | "admin">(initialTab)

  useEffect(() => {
    const next = (searchParams.get("tab") as "profile" | "preferences" | "security" | "admin" | null) || "profile"
    setActiveTab(next)
  }, [searchParams])

  const onTabChange = (tab: "profile" | "preferences" | "security" | "admin") => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", tab)
    router.push(url.pathname + "?" + url.searchParams.toString())
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} className="w-full">
          <TabsList className="flex w-full flex-nowrap gap-2 overflow-x-auto">
            <TabsTrigger value="profile" onClick={() => onTabChange("profile")}>Profile</TabsTrigger>
            <TabsTrigger value="preferences" onClick={() => onTabChange("preferences")}>Preferences</TabsTrigger>
            <TabsTrigger value="security" onClick={() => onTabChange("security")}>Security</TabsTrigger>
            <TabsTrigger value="admin" onClick={() => onTabChange("admin")}>Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-600">This avatar is generated from your initials.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                    {/* <p className="text-xs text-gray-500">To change your email, use the Security tab or contact support.</p> */}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                </div>
                {profileMessage && (
                  <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                    {profileMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Configure how you use the app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark mode</p>
                      <p className="text-sm text-gray-600">Use a darker color scheme</p>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? "bg-gray-900" : "bg-gray-300"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${darkMode ? "translate-x-5" : "translate-x-1"}`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-sm text-gray-600">Receive updates by email</p>
                    </div>
                    <button
                      onClick={() => setNotificationsEmail(!notificationsEmail)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEmail ? "bg-green-600" : "bg-gray-300"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notificationsEmail ? "translate-x-5" : "translate-x-1"}`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS notifications</p>
                      <p className="text-sm text-gray-600">Receive alerts on your phone</p>
                    </div>
                    <button
                      onClick={() => setNotificationsSms(!notificationsSms)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsSms ? "bg-green-600" : "bg-gray-300"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notificationsSms ? "translate-x-5" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button className="w-full sm:w-auto">Save Preferences</Button>
                  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm password</Label>
                    <Input id="confirm" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button className="w-full sm:w-auto">Update Password</Button>
                  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="admin" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>Add users and assign roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="adminName">Name</Label>
                      <Input id="adminName" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Alex Johnson" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input id="adminEmail" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="e.g. alex@example.com" />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label>Role</Label>
                      <Select value={newUserRole} onValueChange={(val) => setNewUserRole(val as Role)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Button onClick={addUser} className="w-full md:w-auto" disabled={inviting}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {inviting ? "Inviting..." : "Add User"}
                    </Button>
                  </div>

                  {inviteMessage && (
                    <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                      <p>{inviteMessage}</p>
                      {lastInviteLink && (
                        <div className="mt-2 flex items-center gap-2">
                          <Input readOnly value={lastInviteLink} />
                          <Button variant="outline" onClick={() => navigator.clipboard.writeText(lastInviteLink!)}>
                            Copy link
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Select value={u.role} onValueChange={(val) => updateUserRole(u.id, val as Role)}>
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Admin">Admin</SelectItem>
                                  <SelectItem value="Editor">Editor</SelectItem>
                                  <SelectItem value="Viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => removeUser(u.id)} disabled={removingId === u.id}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                {removingId === u.id ? "Removing..." : "Remove"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

type Role = "Admin" | "Editor" | "Viewer"
interface ManagedUser { id: number; name: string; email: string; role: Role }