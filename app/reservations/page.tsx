"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Reservation = {
  id: string
  registrationNumber?: string
  name: string
  email: string
  pricingTotal: number
  pricingDetails?: string
  status: "pending" | "paid" | "cancelled" | "expired"
  createdAt: string
  expiresAt: string
  paidAt?: string
  paymentMethod?: string
  paymentReference?: string
  amountPaid?: number
}

export default function ReservationsAdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | Reservation["status"]>("all")
  const [actionBusy, setActionBusy] = useState<string | null>(null)

  async function load() {
    try {
      const res = await fetch("/api/reservations", { cache: "no-store" })
      const data = await res.json()
      const items: Reservation[] = Array.isArray(data?.reservations) ? data.reservations : []
      setReservations(items)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to load reservations", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return reservations
      .filter((r) => (filterStatus === "all" ? true : r.status === filterStatus))
      .filter((r) =>
        !q ? true :
        r.id.toLowerCase().includes(q) ||
        (r.registrationNumber || "").toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reservations, search, filterStatus])

  async function updateStatus(id: string, status: Reservation["status"], extra?: Partial<Reservation>) {
    try {
      setActionBusy(id)
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update reservation")
      }
      // Refresh list
      await load()
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e?.message || e)
      alert(e?.message || "Failed to update reservation")
    } finally {
      setActionBusy(null)
    }
  }

  function statusBadge(status: Reservation["status"]) {
    const map: Record<Reservation["status"], { text: string; cls: string }> = {
      pending: { text: "Pending", cls: "bg-yellow-600 text-white" },
      paid: { text: "Paid", cls: "bg-green-600 text-white" },
      cancelled: { text: "Cancelled", cls: "bg-red-600 text-white" },
      expired: { text: "Expired", cls: "bg-gray-600 text-white" },
    }
    const { text, cls } = map[status]
    return <Badge variant="secondary" className={cls}>{text}</Badge>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <p className="text-muted-foreground">Track and update payment status</p>
      </header>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Manage Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input placeholder="Search by ID, name, email, registration" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="flex gap-2">
              {(["all", "pending", "paid", "cancelled", "expired"] as const).map((s) => (
                <Button key={s} variant={filterStatus === s ? "default" : "outline"} onClick={() => setFilterStatus(s as any)}>
                  {String(s).toUpperCase()}
                </Button>
              ))}
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading reservations...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No reservations found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total (TZS)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">Reg: {r.registrationNumber || "N/A"}</div>
                    </TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{Number(r.pricingTotal || 0).toLocaleString()}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell>{new Date(r.expiresAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button size="sm" variant="outline" disabled={actionBusy === r.id} onClick={() => updateStatus(r.id, "paid", { paymentMethod: "manual" })}>Mark Paid</Button>
                        <Button size="sm" variant="outline" disabled={actionBusy === r.id} onClick={() => updateStatus(r.id, "cancelled")}>Cancel</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}