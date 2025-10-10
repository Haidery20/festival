"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, BarChart3, Activity, Clock, CheckCircle, XCircle, Download } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"

const performanceData = [
  { name: "Jan", executions: 4000, success: 3800, failed: 200, avgDuration: 45 },
  { name: "Feb", executions: 3000, success: 2850, failed: 150, avgDuration: 42 },
  { name: "Mar", executions: 5000, success: 4900, failed: 100, avgDuration: 38 },
  { name: "Apr", executions: 2780, success: 2650, failed: 130, avgDuration: 41 },
  { name: "May", executions: 1890, success: 1820, failed: 70, avgDuration: 39 },
  { name: "Jun", executions: 2390, success: 2300, failed: 90, avgDuration: 37 },
  { name: "Jul", executions: 3490, success: 3400, failed: 90, avgDuration: 35 },
]

const workflowDistribution = [
  { name: "Product Sync", value: 35, color: "var(--color-chart-1)" },
  { name: "Data Processing", value: 25, color: "var(--color-chart-2)" },
  { name: "Notifications", value: 20, color: "var(--color-chart-3)" },
  { name: "Analytics", value: 15, color: "var(--color-chart-4)" },
  { name: "Other", value: 5, color: "#ef4444" },
]

const errorAnalysis = [
  { name: "Timeout", count: 45, percentage: 35 },
  { name: "API Error", count: 32, percentage: 25 },
  { name: "Data Validation", count: 28, percentage: 22 },
  { name: "Network", count: 15, percentage: 12 },
  { name: "Other", count: 8, percentage: 6 },
]

const kpiData = [
  {
    title: "Total Executions",
    value: "24,847",
    change: "+12.5%",
    trend: "up",
    icon: Activity,
    description: "This month",
  },
  {
    title: "Success Rate",
    value: "98.7%",
    change: "+0.3%",
    trend: "up",
    icon: CheckCircle,
    description: "Last 30 days",
  },
  {
    title: "Avg Duration",
    value: "38.2s",
    change: "-2.1s",
    trend: "up",
    icon: Clock,
    description: "Per execution",
  },
  {
    title: "Error Rate",
    value: "1.3%",
    change: "-0.2%",
    trend: "up",
    icon: XCircle,
    description: "Last 30 days",
  },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  // Fetch actual registrations and compute metrics for analytics
  const [registrations, setRegistrations] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const loadRegistrations = async () => {
      try {
        const res = await fetch("/api/registration")
        const json = await res.json()
        if (mounted) {
          setRegistrations(Array.isArray(json?.registrations) ? json.registrations : [])
        }
      } catch (e) {
        if (mounted) setRegistrations([])
      }
    }
    loadRegistrations()
    return () => {
      mounted = false
    }
  }, [])

  // Derive period and group registrations per day for charts
  const periodDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - (periodDays - 1))

  const filteredRegs = registrations.filter((r) => {
    const d = new Date(r?.created_at || Date.now())
    return d >= startDate && d <= endDate
  })

  const isVerified = (r: any) => !!(r?.terms_accepted && r?.insurance_confirmed)

  const days: Date[] = Array.from({ length: periodDays }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    return d
  })

  const formatDayLabel = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" })

  const performanceData = days.map((day) => {
    const dayString = day.toISOString().slice(0, 10)
    const regsForDay = filteredRegs.filter((r) => (r?.created_at || "").slice(0, 10) === dayString)
    const verifiedCount = regsForDay.reduce((acc, r) => acc + (isVerified(r) ? 1 : 0), 0)
    const total = regsForDay.length
    return {
      name: formatDayLabel(day),
      executions: total,
      success: verifiedCount,
      failed: Math.max(total - verifiedCount, 0),
      avgDuration: total,
    }
  })

  // Compute KPI metrics and trends vs previous equal-length period
  const prevStart = new Date(startDate)
  prevStart.setDate(prevStart.getDate() - periodDays)
  const prevEnd = new Date(startDate)
  prevEnd.setDate(prevEnd.getDate() - 1)

  const prevRegs = registrations.filter((r) => {
    const d = new Date(r?.created_at || Date.now())
    return d >= prevStart && d <= prevEnd
  })

  const totalExecutions = filteredRegs.length
  const totalVerified = filteredRegs.reduce((acc, r) => acc + (isVerified(r) ? 1 : 0), 0)
  const totalPending = Math.max(totalExecutions - totalVerified, 0)
  const successRatePct = totalExecutions ? Math.round((totalVerified / totalExecutions) * 1000) / 10 : 0
  const errorRatePct = totalExecutions ? Math.round((totalPending / totalExecutions) * 1000) / 10 : 0
  const avgPerDay = periodDays ? Math.round((totalExecutions / periodDays) * 10) / 10 : 0

  const prevTotal = prevRegs.length
  const prevVerified = prevRegs.reduce((acc, r) => acc + (isVerified(r) ? 1 : 0), 0)
  const prevAvgPerDay = periodDays ? Math.round((prevTotal / periodDays) * 10) / 10 : 0

  const pctChange = (current: number, prev: number) => {
    if (!prev) return "+0%"
    const diff = ((current - prev) / prev) * 100
    const rounded = Math.round(diff * 10) / 10
    return `${rounded >= 0 ? "+" : ""}${rounded}%`
  }
  const trendDir = (current: number, prev: number) => (current >= prev ? "up" : "down")

  const kpiData = [
    {
      title: "Total Registrations",
      value: totalExecutions.toLocaleString(),
      change: pctChange(totalExecutions, prevTotal),
      trend: trendDir(totalExecutions, prevTotal),
      icon: Activity,
      description: "This period",
    },
    {
      title: "Verified Rate",
      value: `${successRatePct}%`,
      change: pctChange(totalVerified, prevVerified),
      trend: trendDir(totalVerified, prevVerified),
      icon: CheckCircle,
      description: "Selected range",
    },
    {
      title: "Avg per day",
      value: `${avgPerDay}`,
      change: pctChange(avgPerDay, prevAvgPerDay),
      trend: trendDir(avgPerDay, prevAvgPerDay),
      icon: Clock,
      description: "Across days",
    },
    {
      title: "Pending Rate",
      value: `${errorRatePct}%`,
      change: pctChange(totalPending, Math.max(prevTotal - prevVerified, 0)),
      trend: trendDir(totalPending, Math.max(prevTotal - prevVerified, 0)),
      icon: XCircle,
      description: "Selected range",
    },
  ]

  // Compute distribution by "hear_about_us" for pie and top list
  const chartPalette = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
  ]
  const distMap = new Map<string, number>()
  filteredRegs.forEach((r) => {
    const key = (r?.hear_about_us || "Other").toString().trim() || "Other"
    distMap.set(key, (distMap.get(key) || 0) + 1)
  })
  const distEntries = Array.from(distMap.entries()).sort((a, b) => b[1] - a[1])
  const topEntries = distEntries.slice(0, chartPalette.length)
  const otherSum = distEntries.slice(chartPalette.length).reduce((acc, [, v]) => acc + v, 0)
  const workflowDistribution = [
    ...topEntries.map(([name, value], idx) => ({ name, value, color: chartPalette[idx] })),
    ...(otherSum > 0 ? [{ name: "Other", value: otherSum, color: "#ef4444" }] : []),
  ]

  // Error analysis based on missing confirmations/consents
  const errorCounts = [
    { name: "Missing Insurance", count: filteredRegs.filter((r) => !r?.insurance_confirmed).length },
    { name: "Missing Terms", count: filteredRegs.filter((r) => !r?.terms_accepted).length },
    { name: "Missing Media Consent", count: filteredRegs.filter((r) => !r?.media_consent).length },
    { name: "Missing Safety Acknowledgement", count: filteredRegs.filter((r) => !r?.safety_acknowledged).length },
  ]
  const errorTotal = errorCounts.reduce((acc, e) => acc + e.count, 0)
  const errorAnalysis = errorCounts.map((e) => ({
    name: e.name,
    count: e.count,
    percentage: errorTotal ? Math.round((e.count / errorTotal) * 1000) / 10 : 0,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Monitor performance and gain insights into your workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <kpi.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      kpi.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {kpi.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.change}
                  </div>
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">{kpi.value}</div>
                <div className="text-sm text-gray-600">{kpi.title}</div>
                <div className="text-xs text-gray-500 mt-1">{kpi.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Workflow Executions</CardTitle>
                <CardDescription>Executions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
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
                      <Line type="monotone" dataKey="executions" stroke="var(--color-chart-1)" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Outcomes</CardTitle>
                <CardDescription>Success vs Failed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
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
                      <Bar dataKey="success" fill="var(--color-chart-1)" name="Success" />
                      <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Key Metrics Summary</CardTitle>
              <CardDescription>Aggregated for selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const totals = performanceData.reduce(
                  (acc, d) => ({
                    executions: acc.executions + d.executions,
                    success: acc.success + d.success,
                    failed: acc.failed + d.failed,
                    durationSum: acc.durationSum + d.avgDuration,
                    count: acc.count + 1,
                  }),
                  { executions: 0, success: 0, failed: 0, durationSum: 0, count: 0 }
                )
                const successRate = totals.executions ? Math.round((totals.success / totals.executions) * 1000) / 10 : 0
                const errorRate = totals.executions ? Math.round((totals.failed / totals.executions) * 1000) / 10 : 0
                const avgDuration = totals.count ? Math.round((totals.durationSum / totals.count) * 10) / 10 : 0
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm text-gray-600">Total Executions</div>
                      <div className="text-2xl font-semibold text-gray-900">{totals.executions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                      <div className="text-2xl font-semibold text-gray-900">{successRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Avg Duration</div>
                      <div className="text-2xl font-semibold text-gray-900">{avgDuration}s</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                      <div className="text-2xl font-semibold text-gray-900">{errorRate}%</div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6 hidden">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="errors">Error Analysis</TabsTrigger>
            <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Execution Trends */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Execution Trends</CardTitle>
                  <CardDescription>Workflow executions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
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
                          dataKey="executions"
                          stroke="var(--color-chart-1)"
                          fill="var(--color-chart-1)"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Success vs Failed */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Success vs Failed</CardTitle>
                  <CardDescription>Execution outcomes comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
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
                        <Bar dataKey="success" fill="var(--color-chart-1)" name="Success" />
                        <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Average Duration */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Average Execution Duration</CardTitle>
                <CardDescription>Performance trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
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
                      <Line
                        type="monotone"
                        dataKey="avgDuration"
                        stroke="var(--color-chart-1)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-chart-1)", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workflow Distribution */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Workflow Distribution</CardTitle>
                  <CardDescription>Execution breakdown by workflow type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={workflowDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {workflowDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Workflows */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Top Performing Workflows</CardTitle>
                  <CardDescription>Most executed workflows this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflowDistribution.map((workflow, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: workflow.color }}></div>
                          <span className="font-medium text-gray-900">{workflow.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{workflow.value}%</span>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {Math.floor(workflow.value * 50)} runs
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Error Types */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Error Types</CardTitle>
                  <CardDescription>Most common error categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {errorAnalysis.map((error, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{error.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{error.count} errors</span>
                            <span className="text-sm font-medium">{error.percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${error.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Error Trends */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Error Trends</CardTitle>
                  <CardDescription>Error rate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
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
                        <Line
                          type="monotone"
                          dataKey="failed"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Patterns Coming Soon</h3>
              <p className="text-gray-600">Advanced usage analytics and patterns will be available soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
