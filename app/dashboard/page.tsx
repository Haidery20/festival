"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Bell,
  Home,
  BarChart3,
  Settings,
  AlertTriangle,
  RefreshCw,
  MoreHorizontal,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Plus,
  ArrowRight,
  Users,
  Eye,
  Database,
  Download,
} from "lucide-react"
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import * as XLSX from "xlsx"

// Sample data
 type Registration = {
   id: string
   registration_number: string
   first_name: string
   last_name: string
   email: string
   phone: string
   vehicle_model: string
   vehicle_year: string
   model_description: string
   created_at: string
   terms_accepted: boolean
   insurance_confirmed: boolean
   safety_acknowledged: boolean
   media_consent: boolean
 }

 const workflowData: any[] = []

 const chartData: any[] = []

 const teamMembers: any[] = []

 export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 days")
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Read username from cookie for header display
  const username = typeof document !== "undefined"
    ? document.cookie
        .split("; ")
        .find((row) => row.startsWith("dashboard_user="))
        ?.split("=")[1]
    : undefined
  const displayName = username || "Land Rover Festival"

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const response = await fetch("/api/registration")
        const data = await response.json()
        if (data.registrations) {
          setRegistrations(data.registrations)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch registrations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegistrations()
  }, [])

  function exportToExcel() {
    const headers = [
      "Registration Number",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Address",
      "City",
      "Country",
      "Emergency Contact",
      "Emergency Phone",
      "Vehicle Model",
      "Vehicle Year",
      "Model Description",
      "Engine Size",
      "Modifications",
      "Accommodation Type",
      "Dietary Restrictions",
      "Medical Conditions",
      "Previous Participation",
      "Hear About Us",
      "Terms Accepted",
      "Insurance Confirmed",
      "Safety Acknowledged",
      "Media Consent",
      "Created At",
    ]

    const rows = registrations.map((r) => [
      r.registration_number ?? "",
      r.first_name ?? "",
      r.last_name ?? "",
      r.email ?? "",
      r.phone ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.address ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.city ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.country ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.emergency_contact ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.emergency_phone ?? "",
      r.vehicle_model ?? "",
      r.vehicle_year ?? "",
      r.model_description ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.engine_size ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.modifications ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.accommodation_type ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.dietary_restrictions ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.medical_conditions ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.previous_participation ?? "",
      // @ts-expect-error optional fields may exist on server records
      r.hear_about_us ?? "",
      r.terms_accepted ? "Yes" : "No",
      r.insurance_confirmed ? "Yes" : "No",
      r.safety_acknowledged ? "Yes" : "No",
      r.media_consent ? "Yes" : "No",
      r.created_at ?? "",
    ])

    const wb = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    XLSX.utils.book_append_sheet(wb, sheet, "Registrations")
    XLSX.writeFile(wb, "registrations.xlsx")
  }

  const filteredRegistrations = registrations.filter((reg) => {
    const query = searchQuery.toLowerCase()
    return (
      reg.registration_number.toLowerCase().includes(query) ||
      reg.first_name.toLowerCase().includes(query) ||
      reg.last_name.toLowerCase().includes(query) ||
      reg.email.toLowerCase().includes(query) ||
      reg.vehicle_model.toLowerCase().includes(query)
    )
  })

  const totalRegistrations = registrations.length
  const recentRegistrations = registrations.filter((reg) => {
    const regDate = new Date(reg.created_at)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return regDate > dayAgo
  }).length

  const updatedMetricsData = [
    {
      label: "Total Registrations",
      value: totalRegistrations.toString(),
      change: `+${recentRegistrations}`,
      trend: "up",
      icon: Users,
    },
    {
      label: "Verified",
      value: registrations.filter((r) => r.terms_accepted && r.insurance_confirmed).length.toString(),
      change: "+98%",
      trend: "up",
      icon: CheckCircle,
    },
    {
      label: "This Week",
      value: registrations
        .filter((reg) => {
          const regDate = new Date(reg.created_at)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return regDate > weekAgo
        })
        .length.toString(),
      change: "+12",
      trend: "up",
      icon: TrendingUp,
    },
    {
      label: "Active Today",
      value: recentRegistrations.toString(),
      change: `+${recentRegistrations}`,
      trend: "up",
      icon: Clock,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Festival logo replaces the previous Workflow icon */}
            <img src="/festivallogo.svg" alt="Festival Logo" className="h-8 w-auto" />
            <span className="font-semibold text-gray-900">{displayName}</span>
          </div>
          <div className="text-sm text-gray-500">
            <span>Dashboard</span> <span className="mx-1">/</span> <span>Registrations</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search registrations..."
              className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>AE</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Alex Evans</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Sign out</DropdownMenuItem>
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
              <Link
                href="/dashboard"
                className="flex items-center w-full justify-start bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Home className="w-4 h-4 mr-3" />
                Overview
              </Link>
              <Link
                href="/dashboard/analytics"
                className="flex items-center w-full justify-start text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Analytics
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center w-full justify-start text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          {/* Quick Actions Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Event Registrations</h1>
                <p className="text-gray-600 mt-1">Monitor and manage Land Rover Festival registrations</p>
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      {selectedPeriod} <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedPeriod("Last 7 days")}>Last 7 days</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedPeriod("Last 30 days")}>Last 30 days</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedPeriod("Last 90 days")}>Last 90 days</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={exportToExcel}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">New workflow</h3>
                    <p className="text-sm text-gray-600">Create a new automation</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">View breaches</h3>
                    <p className="text-sm text-gray-600">Check failed workflows</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Re-run last failed</h3>
                    <p className="text-sm text-gray-600">Retry failed executions</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {updatedMetricsData.map((metric, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <metric.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}
                    >
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="col-span-2 space-y-8">
              {/* Charts Section */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Performance Analytics</CardTitle>
                      <CardDescription>Workflow execution trends and system metrics</CardDescription>
                    </div>
                    <Tabs defaultValue="workflows" className="w-auto">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="workflows">Workflows</TabsTrigger>
                        <TabsTrigger value="sales">Sales</TabsTrigger>
                        <TabsTrigger value="views">Views</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="workflows"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Status Table */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Recent Workflow Runs</CardTitle>
                      <CardDescription>Monitor your workflow executions and performance</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-medium text-gray-700">Run ID</TableHead>
                        <TableHead className="font-medium text-gray-700">Workflow</TableHead>
                        <TableHead className="font-medium text-gray-700">Started</TableHead>
                        <TableHead className="font-medium text-gray-700">Duration</TableHead>
                        <TableHead className="font-medium text-gray-700">Status</TableHead>
                        <TableHead className="font-medium text-gray-700">Error</TableHead>
                        <TableHead className="font-medium text-gray-700 w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workflowData.map((workflow) => (
                        <TableRow key={workflow.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm">{workflow.id}</TableCell>
                          <TableCell className="font-medium">{workflow.name}</TableCell>
                          <TableCell className="text-gray-600">{workflow.started}</TableCell>
                          <TableCell className="text-gray-600">{workflow.duration}</TableCell>
                          <TableCell>
                            {workflow.status === "running" && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                                Running
                              </Badge>
                            )}
                            {workflow.status === "success" && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Success
                              </Badge>
                            )}
                            {workflow.status === "failed" && (
                              <Badge variant="secondary" className="bg-red-100 text-red-700">
                                <XCircle className="w-3 h-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-48 truncate">{workflow.error || "None"}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-8 h-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Re-run</DropdownMenuItem>
                                <DropdownMenuItem>View Logs</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Registration Table */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">All Registrations</CardTitle>
                      <CardDescription>Complete list of event registrations from your website</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading registrations...</div>
                  ) : filteredRegistrations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {searchQuery
                        ? "No registrations match your search."
                        : "No registrations yet. Waiting for submissions from your website."}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-medium text-gray-700">Reg. Number</TableHead>
                          <TableHead className="font-medium text-gray-700">Name</TableHead>
                          <TableHead className="font-medium text-gray-700">Email</TableHead>
                          <TableHead className="font-medium text-gray-700">Phone</TableHead>
                          <TableHead className="font-medium text-gray-700">Vehicle</TableHead>
                          <TableHead className="font-medium text-gray-700">Date</TableHead>
                          <TableHead className="font-medium text-gray-700">Status</TableHead>
                          <TableHead className="font-medium text-gray-700 w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRegistrations.map((registration) => (
                          <TableRow key={registration.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-sm">{registration.registration_number}</TableCell>
                            <TableCell className="font-medium">
                              {registration.first_name} {registration.last_name}
                            </TableCell>
                            <TableCell className="text-gray-600">{registration.email}</TableCell>
                            <TableCell className="text-gray-600">{registration.phone}</TableCell>
                            <TableCell className="text-gray-600">
                              {registration.vehicle_year} {registration.vehicle_model}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(registration.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {registration.terms_accepted && registration.insurance_confirmed ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="w-8 h-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Send Email</DropdownMenuItem>
                                  <DropdownMenuItem>Download Info</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Registration Stats */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Registration Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-gray-900 mb-4">{totalRegistrations}</div>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="text-sm font-medium">
                        {
                          registrations.filter((reg) => {
                            const regDate = new Date(reg.created_at)
                            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            return regDate > weekAgo
                          }).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Today</span>
                      <span className="text-sm font-medium">{recentRegistrations}</span>
                    </div>
                    <Progress value={(recentRegistrations / Math.max(totalRegistrations, 1)) * 100} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      View Report
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Recent Registrations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {registrations.slice(0, 5).map((reg) => (
                      <div
                        key={reg.id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {reg.first_name} {reg.last_name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {reg.vehicle_model} • {new Date(reg.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {registrations.length === 0 && (
                      <div className="p-4 text-sm text-gray-500 text-center">No registrations yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Team Status */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Team Status</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                              member.status === "online" ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-600">
                            {member.role} • {member.availability}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
