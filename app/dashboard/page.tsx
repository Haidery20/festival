"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Bell,
  Home,
  BarChart3,
  Settings,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  Users,
  Eye,
  MoreHorizontal,
  Download,
} from "lucide-react"
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
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import * as XLSX from "xlsx"
import { DashboardLayout } from "@/components/dashboard-layout"

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
  accommodation_type?: string
  created_at: string
  terms_accepted: boolean
  insurance_confirmed: boolean
}

export default function Dashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending">("all")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const router = useRouter()
  const { toast } = useToast()

  const username = typeof document !== "undefined"
    ? document.cookie
        .split("; ")
        .find((row) => row.startsWith("dashboard_user="))
        ?.split("=")[1]
    : undefined
  const displayName = username || "Land Rover Festival"
  const initials = (displayName || "LF").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const response = await fetch("/api/registration")
        const data = await response.json()
        if (data.registrations) {
          setRegistrations(data.registrations)
        }
      } catch (error) {
        console.error("Failed to fetch registrations:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRegistrations()
  }, [])

  const filteredRegistrations = registrations.filter((reg) => {
    const query = searchQuery.toLowerCase()
    const matchesQuery =
      reg.registration_number.toLowerCase().includes(query) ||
      reg.first_name.toLowerCase().includes(query) ||
      reg.last_name.toLowerCase().includes(query) ||
      reg.email.toLowerCase().includes(query) ||
      reg.vehicle_model.toLowerCase().includes(query)
    const isVerified = reg.terms_accepted && reg.insurance_confirmed
    const matchesStatus =
      filterStatus === "all" ? true : filterStatus === "verified" ? isVerified : !isVerified
    return matchesQuery && matchesStatus
  })

  const totalPages = Math.ceil(filteredRegistrations.length / rowsPerPage)
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  function exportToExcel() {
    const headers = [
      "Registration Number",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Vehicle Model",
      "Vehicle Year",
      "Model Description",
      "Accommodation Type",
      "Terms Accepted",
      "Insurance Confirmed",
      "Created At",
    ]
    const rows = registrations.map((r) => [
      r.registration_number,
      r.first_name,
      r.last_name,
      r.email,
      r.phone,
      r.vehicle_model,
      r.vehicle_year,
      r.model_description,
      r.accommodation_type ?? "",
      r.terms_accepted ? "Yes" : "No",
      r.insurance_confirmed ? "Yes" : "No",
      r.created_at,
    ])
    const wb = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    XLSX.utils.book_append_sheet(wb, sheet, "Registrations")
    XLSX.writeFile(wb, "registrations.xlsx")
  }

  const viewDetails = (reg: Registration) => {
    setSelectedRegistration(reg)
    setDetailsOpen(true)
  }

  async function deleteRegistration(reg: Registration) {
    try {
      const res = await fetch(`/api/registration?${new URLSearchParams({ id: reg.id })}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setRegistrations((prev) => prev.filter((r) => r.id !== reg.id))
      toast({ title: "Deleted", description: `Registration ${reg.registration_number} deleted.` })
    } catch (e) {
      toast({ title: "Delete failed", description: String(e), variant: "destructive" })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Event Registrations</h1>
            <p className="text-gray-600 mt-1">Monitor and manage Land Rover Festival registrations</p>
          </div>
          <Button onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        <Card className="border-gray-200">
          <CardHeader className="pb-4 flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold">All Registrations</CardTitle>
              <CardDescription>Complete list of event registrations</CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("verified")}>Verified</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={() => { setFilterStatus("all"); setSearchQuery("") }}>
                <Eye className="w-4 h-4 mr-2" /> View All
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading registrations...</div>
            ) : paginatedRegistrations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No registrations found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Reg. Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRegistrations.map((registration) => (
                      <TableRow key={registration.id} className="hover:bg-gray-50">
                        <TableCell>{registration.registration_number}</TableCell>
                        <TableCell>{registration.first_name} {registration.last_name}</TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>{registration.phone}</TableCell>
                        <TableCell>{registration.vehicle_year} {registration.vehicle_model}</TableCell>
                        <TableCell>{new Date(registration.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {registration.terms_accepted && registration.insurance_confirmed ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <Clock className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                              <Clock className="w-3 h-3 mr-1" /> Pending
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
                              <DropdownMenuItem onClick={() => viewDetails(registration)}>View Details</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteRegistration(registration)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                className="border border-gray-300 rounded-md px-2 py-1"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
              >
                {[10, 15, 20, 25].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>Page {currentPage} of {totalPages || 1}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registration Details</DialogTitle>
              <DialogDescription>Review the selected registration details</DialogDescription>
            </DialogHeader>
            {selectedRegistration ? (
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Registration #:</span> {selectedRegistration.registration_number}</div>
                <div><span className="font-medium">Name:</span> {selectedRegistration.first_name} {selectedRegistration.last_name}</div>
                <div><span className="font-medium">Email:</span> {selectedRegistration.email}</div>
                <div><span className="font-medium">Phone:</span> {selectedRegistration.phone}</div>
                <div><span className="font-medium">Vehicle:</span> {selectedRegistration.vehicle_year} {selectedRegistration.vehicle_model}</div>
                <div><span className="font-medium">Model Description:</span> {selectedRegistration.model_description}</div>
                <div><span className="font-medium">Created:</span> {new Date(selectedRegistration.created_at).toLocaleString()}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No registration selected.</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
