"use client"

import { useState } from "react"
import {
  Save,
  Bell,
  Shield,
  CreditCard,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload,
  Users,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    workflowSuccess: true,
    workflowFailure: true,
    weeklyReport: true,
    securityAlerts: true,
  })

  // Users & Roles state and helpers
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string; activated?: boolean; password?: string }>>([
    { id: "u-1", name: "Alex Evans", email: "alex@company.com", role: "Admin", activated: true },
    { id: "u-2", name: "Jamie Lee", email: "jamie@company.com", role: "Manager", activated: false },
  ])
  const roles = ["Admin", "Manager", "Analyst", "Viewer"]
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<string>("Viewer")
  const [newPassword, setNewPassword] = useState("")

  const addUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`
    setUsers((prev) => [...prev, { id, name: newName.trim(), email: newEmail.trim(), role: newRole, activated: false, password: newPassword }])
    setNewName("")
    setNewEmail("")
    setNewPassword("")
    setNewRole("Viewer")
  }

  const updateUserRole = (id: string, role: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
  }

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account preferences and configuration</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users & Roles
            </TabsTrigger>
          </TabsList>

          {/* Users & Roles */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Team & Access</CardTitle>
                <CardDescription>Add assistants and assign roles for monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add User Form */}
                <form onSubmit={addUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="user-name">Name</Label>
                    <Input id="user-name" placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="user-email">Email</Label>
                    <Input id="user-email" type="email" placeholder="name@company.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  </div>
                   <div className="space-y-2 md:col-span-1">
                     <Label htmlFor="user-password">Password</Label>
                     <Input id="user-password" type="password" placeholder="Create a password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="user-role">Role</Label>
                     <Select value={newRole} onValueChange={(v) => setNewRole(v)}>
                       <SelectTrigger id="user-role">
                         <SelectValue placeholder="Select a role" />
                       </SelectTrigger>
                       <SelectContent>
                         {roles.map((r) => (
                           <SelectItem key={r} value={r}>{r}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="flex items-end md:col-span-1">
                     <Button type="submit" className="w-full gap-2">
                       <UserPlus className="w-4 h-4" />
                       Add User
                     </Button>
                   </div>
                 </form>

                {/* Users List */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Team Members</h3>
                  <div className="space-y-2">
                    {users.length === 0 ? (
                      <p className="text-sm text-gray-600">No team members yet. Add users above to grant access.</p>
                    ) : (
                      users.map((u) => (
                         <div key={u.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border rounded-md p-3">
                           <div className="space-y-1">
                             <div className="flex items-center gap-2">
                               <span className="font-medium text-gray-900">{u.name}</span>
                               <Badge variant="outline">{u.role}</Badge>
                             </div>
                             <div className="text-sm text-gray-600">{u.email}</div>
                           </div>
                           <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2">
                               <Label htmlFor={`activate-${u.id}`}>Activate</Label>
                               <Switch id={`activate-${u.id}`} checked={!!u.activated} onCheckedChange={(val) => setUsers((prev) => prev.map((usr) => usr.id === u.id ? { ...usr, activated: val } : usr))} />
                             </div>
                             <Select value={u.role} onValueChange={(v) => updateUserRole(u.id, v)}>
                               <SelectTrigger className="w-[160px]">
                                 <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                 {roles.map((r) => (
                                   <SelectItem key={r} value={r}>{r}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <Button variant="outline" className="gap-2" onClick={() => removeUser(u.id)}>
                               <Trash2 className="w-4 h-4" />
                               Remove
                             </Button>
                           </div>
                         </div>
                       ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback className="text-lg">AE</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </Button>
                    <p className="text-sm text-gray-600">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Evans" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="alex@company.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                </div>

                <div className="space-y-2 hidden">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    defaultValue="Product manager passionate about automation and workflow optimization."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="pst">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                      <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                      <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                      <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                      <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about important events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium">Email Notifications</div>
                          <div className="text-sm text-gray-600">Receive notifications via email</div>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(value) => handleNotificationChange("email", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium">Push Notifications</div>
                          <div className="text-sm text-gray-600">Receive browser push notifications</div>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(value) => handleNotificationChange("push", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium">SMS Notifications</div>
                          <div className="text-sm text-gray-600">Receive text message alerts</div>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(value) => handleNotificationChange("sms", value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Event Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Workflow Success</div>
                        <div className="text-sm text-gray-600">When workflows complete successfully</div>
                      </div>
                      <Switch
                        checked={notifications.workflowSuccess}
                        onCheckedChange={(value) => handleNotificationChange("workflowSuccess", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Workflow Failure</div>
                        <div className="text-sm text-gray-600">When workflows fail or encounter errors</div>
                      </div>
                      <Switch
                        checked={notifications.workflowFailure}
                        onCheckedChange={(value) => handleNotificationChange("workflowFailure", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Weekly Reports</div>
                        <div className="text-sm text-gray-600">Weekly summary of workflow performance</div>
                      </div>
                      <Switch
                        checked={notifications.weeklyReport}
                        onCheckedChange={(value) => handleNotificationChange("weeklyReport", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Security Alerts</div>
                        <div className="text-sm text-gray-600">Important security and account notifications</div>
                      </div>
                      <Switch
                        checked={notifications.securityAlerts}
                        onCheckedChange={(value) => handleNotificationChange("securityAlerts", value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" placeholder="Enter new password" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                    </div>

                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Lock className="w-4 h-4" />
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">Authenticator App</div>
                      <div className="text-sm text-gray-600">Use an authenticator app for additional security</div>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      Disabled
                    </Badge>
                  </div>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Shield className="w-4 h-4" />
                    Enable 2FA
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">Current Session</div>
                        <div className="text-sm text-gray-600">Chrome on macOS • San Francisco, CA</div>
                        <div className="text-xs text-gray-500">Last active: Now</div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Current
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">Mobile App</div>
                        <div className="text-sm text-gray-600">iPhone • San Francisco, CA</div>
                        <div className="text-xs text-gray-500">Last active: 2 hours ago</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6 hidden">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Current Plan</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-lg">Pro Plan</div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        Active
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      $29/month • Billed monthly • Next billing: Jan 15, 2025
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Change Plan
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Payment Method</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <Badge variant="secondary">Default</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Expires 12/2027</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Update Card
                      </Button>
                      <Button variant="outline" size="sm">
                        Add Payment Method
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Billing History</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">Dec 15, 2024</div>
                        <div className="text-sm text-gray-600">Pro Plan - Monthly</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">$29.00</span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">Nov 15, 2024</div>
                        <div className="text-sm text-gray-600">Pro Plan - Monthly</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">$29.00</span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>Customize your application experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Appearance</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select defaultValue="light">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Data & Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Analytics & Usage Data</div>
                        <div className="text-sm text-gray-600">Help improve our product by sharing usage data</div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Marketing Communications</div>
                        <div className="text-sm text-gray-600">Receive product updates and marketing emails</div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Data Export</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Export your data including workflows, logs, and account information.
                    </p>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Export Data
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 text-red-600">Danger Zone</h3>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium text-red-900">Delete Account</div>
                        <div className="text-sm text-red-700">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </div>
                      </div>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
