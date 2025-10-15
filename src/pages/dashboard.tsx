"use client"

import { AppShell, Section } from "../components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Badge } from "../components/ui/badge"
import {
  CheckSquare,
  HeartPulse,
  Users,
  Wallet,
  AlertTriangle,
  MessageSquare,
  Camera,
  CalendarDays,
  Sparkles,
  Activity,
  DollarSign,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ImageIcon,
  FileText,
  BookOpen,
  UserCog,
  TrendingUp,
  Baby,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { cn } from "../lib/utils"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface DashboardStats {
  // Children
  totalChildren: number
  childrenPresent: number
  childrenAbsent: number

  // Attendance
  checkInsToday: number
  checkOutsToday: number
  attendanceRate: number

  // Billing
  totalRevenue: number
  revenueCollected: number
  revenueOverdue: number
  openInvoices: number
  paidInvoices: number
  overdueInvoices: number

  // Health
  healthAlerts: number
  healthRecordsTotal: number

  // Media & Albums
  totalMedia: number
  mediaToday: number
  totalAlbums: number

  // Reports
  reportsGenerated: number

  // Staff & Shifts
  totalStaff: number
  activeShifts: number
  staffOnDuty: number

  // Bookings & Events
  activeBookings: number
  upcomingEvents: number
  todayEvents: number

  // Users
  totalUsers: number
  activeUsers: number
}

interface QuickStats {
  id: string
  label: string
  value: string | number
  icon: any
  gradient: string
  bgGradient: string
  iconBg: string
  iconColor: string
  trend?: string
  trendUp?: boolean
}


function StunningHero({ stats, loading }: { stats: DashboardStats | null; loading: boolean }) {
  const navigate = useNavigate()
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
      {/* Multi-layer animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-transparent to-pink-500/30 animate-pulse" />
      <div
        className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 via-transparent to-purple-500/20"
        style={{ animation: "pulse 3s ease-in-out infinite alternate" }}
      />

      {/* Floating decorative orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300/10 rounded-full blur-3xl animate-float-slow" />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff2_1px,transparent_1px),linear-gradient(to_bottom,#fff2_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />

      <div className="relative p-8 md:p-12 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl border-2 border-white/30 shadow-2xl">
            <Sparkles className="h-10 w-10 animate-pulse drop-shadow-glow text-yellow-200" />
          </div>

          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-balance drop-shadow-lg mb-4">
              Welcome back! 🎉
            </h1>
            <p className="text-xl md:text-2xl text-white/95 text-pretty font-semibold mb-4">
              Your childcare center at a glance
            </p>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-bold">Real-time Data</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-bold">Smart Analytics</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-bold">AI Insights</span>
              </div>
            </div>
          </div>

          <div className="hidden xl:flex flex-col gap-3">
            <Button
              onClick={() => navigate("/messages")}
              variant="secondary"
              className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-purple-600 hover:bg-white/90 font-semibold hover:scale-105"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
            <Button
              onClick={() => navigate("/calendar")}
              variant="secondary"
              className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 text-purple-600 hover:bg-white font-semibold hover:scale-105"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Enhanced KPI Cards in Hero */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/15 p-6 backdrop-blur-xl border border-white/20 animate-pulse shadow-xl"
              >
                <div className="h-4 bg-white/20 rounded w-28 mb-3" />
                <div className="h-10 bg-white/20 rounded w-24 mb-3" />
                <div className="h-2.5 bg-white/20 rounded" />
              </div>
            ))
            : [
              {
                label: "Attendance Rate",
                value: `${stats?.attendanceRate || 0}%`,
                bar: stats?.attendanceRate || 0,
                icon: UserCheck,
                trend: "+5%",
                trendUp: true,
                subtext: `${stats?.childrenPresent || 0}/${stats?.totalChildren || 0} present`,
              },
              {
                label: "Revenue Collected",
                value: `$${(stats?.revenueCollected || 0).toLocaleString()}`,
                bar:
                  stats?.revenueCollected && stats?.totalRevenue
                    ? Math.round((stats.revenueCollected / stats.totalRevenue) * 100)
                    : 0,
                icon: DollarSign,
                trend: "+12%",
                trendUp: true,
                subtext: `${stats?.paidInvoices || 0} paid invoices`,
              },
              {
                label: "Active Staff",
                value: stats?.staffOnDuty || 0,
                bar:
                  stats?.staffOnDuty && stats?.totalStaff
                    ? Math.round((stats.staffOnDuty / stats.totalStaff) * 100)
                    : 0,
                icon: UserCog,
                trend: "On duty",
                trendUp: true,
                subtext: `${stats?.activeShifts || 0} active shifts`,
              },
              {
                label: "Media Shared",
                value: stats?.totalMedia || 0,
                bar: Math.min((stats?.mediaToday || 0) * 10, 100),
                icon: Camera,
                trend: `+${stats?.mediaToday || 0}`,
                trendUp: true,
                subtext: `${stats?.totalAlbums || 0} albums`,
              },
            ].map((s) => {
              const Icon = s.icon
              const TrendIcon = s.trendUp ? ArrowUpRight : ArrowDownRight
              return (
                <div
                  key={s.label}
                  className="group rounded-2xl bg-white/15 p-6 backdrop-blur-xl border border-white/20 hover:bg-white/25 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-white/90 font-bold uppercase tracking-wider">{s.label}</div>
                    <Icon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <div className="text-4xl font-black text-white drop-shadow-lg">{s.value}</div>
                    <div
                      className={cn(
                        "flex items-center gap-0.5 text-xs font-bold mb-2",
                        s.trendUp ? "text-emerald-200" : "text-rose-200",
                      )}
                    >
                      <TrendIcon className="h-3.5 w-3.5" />
                      {s.trend}
                    </div>
                  </div>
                  <div className="text-xs text-white/75 mb-3 font-medium">{s.subtext}</div>
                  <div className="h-3 rounded-full bg-white/20 overflow-hidden shadow-inner">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-white/90 to-white shadow-lg transition-all duration-1000 ease-out"
                      style={{ width: `${s.bar}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const navigate = useNavigate()


  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log("[Dashboard] Fetching comprehensive data from localhost:8080...")
      setLoading(true)
      setError(null)


      try {
        // Fetch all entities in parallel
        const responses = await Promise.allSettled([
          fetch("http://localhost:8080/children"),
          fetch("http://localhost:8080/attendance"),
          fetch("http://localhost:8080/billing"),
          fetch("http://localhost:8080/health"),
          fetch("http://localhost:8080/media/albums"), // Media endpoint
          fetch("http://localhost:8080/report"),
          fetch("http://localhost:8080/shift"),
          fetch("http://localhost:8080/booking"),
          fetch("http://localhost:8080/calendar/events"),
          fetch("http://localhost:8080/media/albums"),
          fetch("http://localhost:8080/staff"),
          fetch("http://localhost:8080/users"),
        ])

        // Process responses safely
        const [
          childrenRes,
          attendanceRes,
          billingRes,
          healthRes,
          mediaRes,
          reportRes,
          shiftRes,
          bookingRes,
          eventRes,
          albumRes,
          staffRes,
          userRes,
        ] = responses

        // Parse successful responses
        const children =
          childrenRes.status === "fulfilled" && childrenRes.value.ok ? await childrenRes.value.json() : []
        const attendance =
          attendanceRes.status === "fulfilled" && attendanceRes.value.ok ? await attendanceRes.value.json() : []
        const billing = billingRes.status === "fulfilled" && billingRes.value.ok ? await billingRes.value.json() : []
        const health = healthRes.status === "fulfilled" && healthRes.value.ok ? await healthRes.value.json() : []
        const media = mediaRes.status === "fulfilled" && mediaRes.value.ok ? await mediaRes.value.json() : []
        const reports = reportRes.status === "fulfilled" && reportRes.value.ok ? await reportRes.value.json() : []
        const shifts = shiftRes.status === "fulfilled" && shiftRes.value.ok ? await shiftRes.value.json() : []
        const bookings = bookingRes.status === "fulfilled" && bookingRes.value.ok ? await bookingRes.value.json() : []
        const events = eventRes.status === "fulfilled" && eventRes.value.ok ? await eventRes.value.json() : []
        const albums = albumRes.status === "fulfilled" && albumRes.value.ok ? await albumRes.value.json() : []
        const staff = staffRes.status === "fulfilled" && staffRes.value.ok ? await staffRes.value.json() : []
        const users = userRes.status === "fulfilled" && userRes.value.ok ? await userRes.value.json() : []

        console.log("[Dashboard] Data fetched:", {
          children: children.length,
          attendance: attendance.length,
          billing: billing.length,
          health: health.length,
          media: media.length,
          reports: reports.length,
          shifts: shifts.length,
          bookings: bookings.length,
          events: events.length,
          albums: albums.length,
          staff: staff.length,
          users: users.length,
        })

        // Calculate comprehensive statistics
        const today = new Date().toISOString().split("T")[0]

        // Children stats
        const totalChildren = Array.isArray(children) ? children.length : 0

        // Attendance stats
        const todayAttendance = Array.isArray(attendance)
          ? attendance.filter(
            (a: any) =>
              a.date?.startsWith(today) || a.timestamp?.startsWith(today) || a.checkInTime?.startsWith(today),
          )
          : []

        const presentCount = todayAttendance.filter(
          (a: any) => a.status === "present" || a.status === "checked_in",
        ).length

        const checkInsToday = todayAttendance.filter((a: any) => a.checkInTime).length
        const checkOutsToday = todayAttendance.filter((a: any) => a.checkOutTime).length
        const attendanceRate = totalChildren > 0 ? Math.round((presentCount / totalChildren) * 100) : 0

        // Billing stats
        const totalRevenue = Array.isArray(billing)
          ? billing.reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0)
          : 0

        const paidBilling = Array.isArray(billing) ? billing.filter((b: any) => b.status === "paid") : []

        const revenueCollected = paidBilling.reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0)

        const overdueBilling = Array.isArray(billing) ? billing.filter((b: any) => b.status === "overdue") : []

        const revenueOverdue = overdueBilling.reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0)

        const openInvoices = Array.isArray(billing) ? billing.filter((b: any) => b.status !== "paid").length : 0

        // Health stats
        const healthAlerts = Array.isArray(health)
          ? health.filter((h: any) => h.severity === "high" || h.priority === "high" || h.alert === true).length
          : 0

        // Media stats
        const totalMedia = Array.isArray(media) ? media.length : 0
        const mediaToday = Array.isArray(media)
          ? media.filter(
            (m: any) =>
              m.timestamp?.startsWith(today) || m.date?.startsWith(today) || m.uploadedAt?.startsWith(today),
          ).length
          : 0

        // Albums stats
        const totalAlbums = Array.isArray(albums) ? albums.length : 0

        // Reports stats
        const reportsGenerated = Array.isArray(reports) ? reports.length : 0

        // Staff & Shifts stats
        const totalStaff = Array.isArray(staff) ? staff.length : 0
        const activeShifts = Array.isArray(shifts)
          ? shifts.filter((s: any) => {
            const shiftDate = s.date || s.shiftDate
            return shiftDate?.startsWith(today) && !s.checkOutTime
          }).length
          : 0

        const staffOnDuty = activeShifts // Simplified - can be more complex

        // Bookings & Events stats
        const activeBookings = Array.isArray(bookings)
          ? bookings.filter((b: any) => b.status === "confirmed" || b.status === "active").length
          : 0

        const upcomingEvents = Array.isArray(events)
          ? events.filter((e: any) => {
            const eventDate = new Date(e.date || e.time || e.startDate)
            return eventDate > new Date()
          }).length
          : 0

        const todayEvents = Array.isArray(events)
          ? events.filter((e: any) => {
            const eventDate = e.date || e.time || e.startDate
            return eventDate?.startsWith(today)
          }).length
          : 0

        // Users stats
        const totalUsers = Array.isArray(users) ? users.length : 0
        const activeUsers = Array.isArray(users)
          ? users.filter((u: any) => u.status === "active" || u.isActive === true).length
          : 0

        setStats({
          totalChildren,
          childrenPresent: presentCount,
          childrenAbsent: totalChildren - presentCount,
          checkInsToday,
          checkOutsToday,
          attendanceRate,
          totalRevenue,
          revenueCollected,
          revenueOverdue,
          openInvoices,
          paidInvoices: paidBilling.length,
          overdueInvoices: overdueBilling.length,
          healthAlerts,
          healthRecordsTotal: Array.isArray(health) ? health.length : 0,
          totalMedia,
          mediaToday,
          totalAlbums,
          reportsGenerated,
          totalStaff,
          activeShifts,
          staffOnDuty,
          activeBookings,
          upcomingEvents,
          todayEvents,
          totalUsers,
          activeUsers,
        })

        setLastUpdate(new Date())
        setError(null)
      } catch (err) {
        console.error("[Dashboard] Error:", err)
        setError("Unable to connect to the backend. Please ensure the server is running on http://localhost:8080")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const quickStats: QuickStats[] = [
    {
      id: "children",
      label: "Total Children",
      value: stats?.totalChildren || 0,
      icon: Baby,
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      trend: `${stats?.childrenPresent || 0} present`,
      trendUp: true,
    },
    {
      id: "attendance",
      label: "Check-ins Today",
      value: stats?.checkInsToday || 0,
      icon: CheckSquare,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: `${stats?.checkOutsToday || 0} check-outs`,
      trendUp: true,
    },
    {
      id: "billing",
      label: "Open Invoices",
      value: stats?.openInvoices || 0,
      icon: Wallet,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      trend: `${stats?.overdueInvoices || 0} overdue`,
      trendUp: false,
    },
    {
      id: "health",
      label: "Health Alerts",
      value: stats?.healthAlerts || 0,
      icon: HeartPulse,
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-50 to-pink-50",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      trend: `${stats?.healthRecordsTotal || 0} records`,
      trendUp: false,
    },
    {
      id: "staff",
      label: "Staff on Duty",
      value: stats?.staffOnDuty || 0,
      icon: UserCog,
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-50 to-violet-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: `${stats?.totalStaff || 0} total staff`,
      trendUp: true,
    },
    {
      id: "events",
      label: "Events Today",
      value: stats?.todayEvents || 0,
      icon: CalendarDays,
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-50 to-blue-50",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      trend: `${stats?.upcomingEvents || 0} upcoming`,
      trendUp: true,
    },
    {
      id: "bookings",
      label: "Active Bookings",
      value: stats?.activeBookings || 0,
      icon: BookOpen,
      gradient: "from-teal-500 to-emerald-500",
      bgGradient: "from-teal-50 to-emerald-50",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
    {
      id: "reports",
      label: "Reports Generated",
      value: stats?.reportsGenerated || 0,
      icon: FileText,
      gradient: "from-slate-500 to-gray-500",
      bgGradient: "from-slate-50 to-gray-50",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
    },
  ]

  return (
    <AppShell>
      <div className="grid gap-6">
        <StunningHero stats={stats} loading={loading} />

        {/* Connection Status */}
        {error ? (
          <div className="relative overflow-hidden rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50 p-6 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5" />
            <div className="relative flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 shrink-0">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-rose-900 text-lg mb-1">Connection Error</p>
                <p className="text-rose-700 mb-3">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <span className="text-xs text-emerald-600">Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.id}
                className={cn(
                  "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-2xl border-2 border-white/50 cursor-pointer",
                  loading && "animate-pulse",
                  `bg-gradient-to-br ${stat.bgGradient}`,
                )}
              >
                {/* Hover gradient effect */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br blur-xl",
                    stat.gradient,
                  )}
                />

                <CardHeader className="relative pb-2">
                  <CardTitle className="text-sm text-gray-600 font-bold uppercase tracking-wide">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative flex items-center justify-between pb-6">
                  {loading ? (
                    <div className="h-12 w-24 bg-gray-200 rounded-lg animate-pulse" />
                  ) : (
                    <div>
                      <div className="text-4xl font-black tabular-nums bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
                        {stat.value}
                      </div>
                      {stat.trend && (
                        <div
                          className={cn("text-xs font-semibold", stat.trendUp ? "text-emerald-600" : "text-gray-500")}
                        >
                          {stat.trend}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      "inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                      stat.iconBg,
                    )}
                  >
                    <Icon className={cn("h-8 w-8", stat.iconColor)} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detailed Sections */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Financial Overview */}
          <Section
            title="Financial Overview"
            description="Revenue tracking and billing status"
          >
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl" />
                <div className="h-20 bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl" />
                <div className="h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-600 uppercase">Total Revenue</span>
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-700">
                    ${(stats?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <Progress
                    value={
                      stats?.revenueCollected && stats?.totalRevenue
                        ? (stats.revenueCollected / stats.totalRevenue) * 100
                        : 0
                    }
                    className="h-2 mt-3 bg-emerald-100"
                  />
                  <div className="text-xs text-emerald-600 font-semibold mt-2">
                    ${(stats?.revenueCollected || 0).toLocaleString()} collected
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-600 uppercase">Overdue</span>
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="text-3xl font-black text-rose-700">
                    ${(stats?.revenueOverdue || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-rose-600 font-semibold mt-2">
                    {stats?.overdueInvoices || 0} overdue invoices
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-600 uppercase">Paid Invoices</span>
                    <CheckSquare className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-3xl font-black text-amber-700">{stats?.paidInvoices || 0}</div>
                  <div className="text-sm text-amber-600 font-semibold mt-2">{stats?.openInvoices || 0} still open</div>
                </div>

                <Button
                  onClick={() => navigate("/billing")}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  View Full Billing
                </Button>
              </div>
            )}
          </Section>

          {/* Operations Status */}
          <Section title="Operations Status" description="Staff, shifts, and bookings">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-purple-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all border-2 border-transparent hover:border-purple-200 group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 group-hover:scale-110 transition-transform">
                    <UserCog className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600">Staff on Duty</div>
                    <div className="text-2xl font-black text-gray-800">{stats?.staffOnDuty || 0}</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                    {stats?.activeShifts || 0} shifts
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all border-2 border-transparent hover:border-blue-200 group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600">Active Shifts</div>
                    <div className="text-2xl font-black text-gray-800">{stats?.activeShifts || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 transition-all border-2 border-transparent hover:border-teal-200 group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600">Active Bookings</div>
                    <div className="text-2xl font-black text-gray-800">{stats?.activeBookings || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all border-2 border-transparent hover:border-indigo-200 group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 group-hover:scale-110 transition-transform">
                    <CalendarDays className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600">Events Today</div>
                    <div className="text-2xl font-black text-gray-800">{stats?.todayEvents || 0}</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                    {stats?.upcomingEvents || 0} upcoming
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 transition-all border-2 border-transparent hover:border-slate-200 group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-gray-100 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600">Reports Generated</div>
                    <div className="text-2xl font-black text-gray-800">{stats?.reportsGenerated || 0}</div>
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* Media & Engagement */}
          <Section title="Media & Engagement" description="Photos, albums, and activity">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-pink-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 transition-all border-2 border-transparent hover:border-pink-200 group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 group-hover:scale-110 transition-transform">
                    <Camera className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600">Total Media</div>
                    <div className="text-2xl font-black text-gray-800">{stats?.totalMedia || 0}</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    +{stats?.mediaToday || 0} today
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-fuchsia-50 transition-all border-2 border-transparent hover:border-purple-200 group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 group-hover:scale-110 transition-transform">
                    <ImageIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600">Albums Created</div>
                    <div className="text-2xl font-black text-gray-800">{stats?.totalAlbums || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition-all border-2 border-transparent hover:border-rose-200 group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 group-hover:scale-110 transition-transform">
                    <HeartPulse className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600">Health Records</div>
                    <div className="text-2xl font-black text-gray-800">{stats?.healthRecordsTotal || 0}</div>
                  </div>
                  {(stats?.healthAlerts || 0) > 0 && (
                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                      {stats?.healthAlerts} alerts
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all border-2 border-transparent hover:border-blue-200 group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600">Active Users</div>
                    <div className="text-2xl font-black text-gray-800">{stats?.activeUsers || 0}</div>
                  </div>
                  <div className="text-xs text-gray-500 font-semibold">of {stats?.totalUsers || 0}</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => navigate("/media")}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-pink-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 bg-transparent"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Media
                  </Button>
                  <Button
                    onClick={() => navigate("/user-management")}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 bg-transparent"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Users
                  </Button>
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-15px) translateX(15px) scale(1.1); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
      `}</style>
    </AppShell>
  )
}
