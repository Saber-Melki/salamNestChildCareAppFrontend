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
} from "lucide-react"
import { Button } from "../components/ui/button"
import { cn } from "../lib/utils"
import { useEffect, useState } from "react"

interface DashboardStats {
  childrenPresent: number
  checkInsToday: number
  openInvoices: number
  healthAlerts: number
  attendanceRate: number
  invoicesPaid: number
  parentSatisfaction: number
  mediaShared: number
  revenueCollected: number
  revenueOverdue: number
  overdueCount: number
  newMessages: number
  photosToday: number
  upcomingEvents: number
}

interface AttendanceRecord {
  id: string
  childName: string
  status: string
  checkInTime?: string
  checkOutTime?: string
  timestamp: string
}

function GradientHero({ stats, loading }: { stats: DashboardStats | null; loading: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-transparent to-pink-500/30 animate-pulse" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff2_1px,transparent_1px),linear-gradient(to_bottom,#fff2_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative p-8 md:p-10 text-white">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
            <Sparkles className="h-7 w-7 animate-pulse drop-shadow-glow" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black leading-tight text-balance drop-shadow-lg">
              Welcome back — let's make today amazing! 🎉
            </h1>
            <p className="mt-3 text-lg text-white/95 text-pretty font-medium">
              Real-time attendance • Billing insights • Family engagement — all in one place
            </p>
          </div>
          <div className="ml-auto hidden lg:flex items-center gap-3">
            <Button
              variant="secondary"
              className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Messages
            </Button>
            <Button
              variant="secondary"
              className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 text-purple-600 hover:bg-white font-semibold"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white/15 p-5 backdrop-blur-xl border border-white/20 animate-pulse shadow-xl"
                >
                  <div className="h-4 bg-white/20 rounded w-28 mb-3" />
                  <div className="h-8 bg-white/20 rounded w-20 mb-3" />
                  <div className="h-2.5 bg-white/20 rounded" />
                </div>
              ))
            : [
                {
                  label: "Attendance rate",
                  value: `${stats?.attendanceRate || 0}%`,
                  bar: stats?.attendanceRate || 0,
                  icon: UserCheck,
                  trend: "+5%",
                  trendUp: true,
                },
                {
                  label: "Invoices paid",
                  value: `${stats?.invoicesPaid || 0}%`,
                  bar: stats?.invoicesPaid || 0,
                  icon: DollarSign,
                  trend: "+12%",
                  trendUp: true,
                },
                {
                  label: "Parent satisfaction",
                  value: "4.8/5",
                  bar: 96,
                  icon: Activity,
                  trend: "+0.3",
                  trendUp: true,
                },
                {
                  label: "Media shared (wk)",
                  value: stats?.mediaShared || 0,
                  bar: Math.min((stats?.mediaShared || 0) / 2, 100),
                  icon: Camera,
                  trend: "+23",
                  trendUp: true,
                },
              ].map((s) => {
                const Icon = s.icon
                const TrendIcon = s.trendUp ? ArrowUpRight : ArrowDownRight
                return (
                  <div
                    key={s.label}
                    className="group rounded-2xl bg-white/15 p-5 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-white/90 font-bold uppercase tracking-wide">{s.label}</div>
                      <Icon className="h-4 w-4 text-white/70 group-hover:text-white/90 transition-colors" />
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                      <div className="text-3xl font-black text-white drop-shadow-lg">{s.value}</div>
                      <div
                        className={cn(
                          "flex items-center gap-0.5 text-xs font-bold mb-1",
                          s.trendUp ? "text-emerald-200" : "text-rose-200",
                        )}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {s.trend}
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/20 overflow-hidden shadow-inner">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-white/80 to-white shadow-lg transition-all duration-700 ease-out"
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
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log("[Dashboard] Fetching data from localhost:8080...")
      setLoading(true)
      setError(null)

      try {
        const [childrenRes, attendanceRes, billingRes, healthRes, mediaRes, scheduleRes] = await Promise.all([
          fetch("http://localhost:8080/children"),
          fetch("http://localhost:8080/attendance"),
          fetch("http://localhost:8080/billing"),
          fetch("http://localhost:8080/health"),
          fetch("http://localhost:8080/media/items"),
          fetch("http://localhost:8080/calendar/events"),
        ])

        if (!childrenRes.ok || !attendanceRes.ok || !billingRes.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const [children, attendance, billing, health, media, schedule] = await Promise.all([
          childrenRes.json(),
          attendanceRes.json(),
          billingRes.json(),
          healthRes.json(),
          mediaRes.json(),
          scheduleRes.json(),
        ])

        const today = new Date().toISOString().split("T")[0]
        const todayAttendance = attendance.filter(
          (a: any) => a.date?.startsWith(today) || a.timestamp?.startsWith(today),
        )

        const presentCount = todayAttendance.filter((a: any) => a.status === "present").length
        const totalChildren = children.length
        const attendanceRate = totalChildren > 0 ? Math.round((presentCount / totalChildren) * 100) : 0

        const totalBilling = billing.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)
        const paidBilling = billing
          .filter((b: any) => b.status === "paid")
          .reduce((sum: number, b: any) => sum + (b.amount || 0), 0)
        const invoicesPaidPercent = totalBilling > 0 ? Math.round((paidBilling / totalBilling) * 100) : 0

        const openInvoices = billing.filter((b: any) => b.status === "unpaid" || b.status === "pending").length
        const overdueBilling = billing.filter((b: any) => b.status === "overdue")
        const overdueAmount = overdueBilling.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)

        const healthAlerts = health.filter((h: any) => h.severity === "high" || h.priority === "high").length

        const todayMedia = media.filter((m: any) => m.timestamp?.startsWith(today) || m.date?.startsWith(today))
        const upcomingEvents = schedule.filter((e: any) => new Date(e.time || e.date) > new Date()).length

        setStats({
          childrenPresent: presentCount,
          checkInsToday: todayAttendance.length,
          openInvoices,
          healthAlerts,
          attendanceRate,
          invoicesPaid: invoicesPaidPercent,
          parentSatisfaction: 4.8,
          mediaShared: media.length,
          revenueCollected: paidBilling,
          revenueOverdue: overdueAmount,
          overdueCount: overdueBilling.length,
          newMessages: 3,
          photosToday: todayMedia.length,
          upcomingEvents,
        })

        const recent = todayAttendance.slice(0, 5).map((a: any) => ({
          id: a.id,
          childName: a.childName || "Unknown",
          status: a.status,
          checkInTime: a.checkInTime,
          checkOutTime: a.checkOutTime,
          timestamp: a.timestamp || a.date,
        }))
        setRecentAttendance(recent)
      } catch (err) {
        console.error("[Dashboard] Error:", err)
        setError("Failed to load dashboard data. Please ensure the backend is running on port 8080.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      label: "Children Present",
      value: stats?.childrenPresent || 0,
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Check-ins Today",
      value: stats?.checkInsToday || 0,
      icon: CheckSquare,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Open Invoices",
      value: stats?.openInvoices || 0,
      icon: Wallet,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Health Alerts",
      value: stats?.healthAlerts || 0,
      icon: HeartPulse,
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-50 to-pink-50",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ]

  return (
    <AppShell>
      <div className="grid gap-6">
        <GradientHero stats={stats} loading={loading} />

        <div className="grid gap-4 md:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon

            return (
              <Card
                key={s.label}
                className={cn(
                  "group relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2 rounded-2xl border-2 border-white/50",
                  loading && "animate-pulse",
                  `bg-gradient-to-br ${s.bgGradient}`,
                )}
              >
                {/* Gradient border effect */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br blur-xl",
                    s.gradient,
                  )}
                />

                <CardHeader className="relative pb-2">
                  <CardTitle className="text-sm text-gray-600 font-bold uppercase tracking-wide">{s.label}</CardTitle>
                </CardHeader>
                <CardContent className="relative flex items-center justify-between pb-6">
                  {loading ? (
                    <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
                  ) : (
                    <div className="text-4xl font-black tabular-nums bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {s.value}
                    </div>
                  )}
                  <div
                    className={cn(
                      "inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                      s.iconBg,
                    )}
                  >
                    <Icon className={cn("h-7 w-7", s.iconColor)} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Section title="Live Attendance" description="Real-time view of check-ins and check-outs">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-12 w-12 bg-purple-100 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-purple-100 rounded w-28" />
                      <div className="h-3 bg-purple-50 rounded w-36" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentAttendance.length > 0 ? (
              <div className="space-y-2">
                {recentAttendance.slice(0, 3).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 border border-transparent hover:border-purple-200"
                  >
                    <div className="relative">
                      <img
                        src="/non-photorealistic-child-avatar.png"
                        alt="Child avatar"
                        width={44}
                        height={44}
                        className="rounded-full ring-2 ring-purple-200"
                      />
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                          record.status === "present" ? "bg-emerald-500" : "bg-rose-500",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{record.childName}</div>
                      <div className="text-xs text-gray-500">
                        {record.checkInTime
                          ? `Check-in: ${new Date(record.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : record.checkOutTime
                            ? `Check-out: ${new Date(record.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : `Status: ${record.status}`}
                      </div>
                    </div>
                    <Badge
                      variant={record.status === "present" ? "secondary" : "destructive"}
                      className={cn(
                        "shadow-sm",
                        record.status === "present" && "bg-emerald-100 text-emerald-700 border-emerald-200",
                      )}
                    >
                      {record.status === "present" ? "Present" : "Away"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-3">
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No attendance records today</p>
              </div>
            )}
          </Section>

          <Section title="Billing Snapshot" description="Revenue and outstanding balances">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-purple-100 rounded" />
                <div className="h-3 bg-purple-50 rounded" />
                <div className="h-4 bg-purple-100 rounded" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-gray-600">Collected (Month)</span>
                    <span className="font-bold text-emerald-700 text-lg">
                      ${stats?.revenueCollected?.toLocaleString() || 0}
                    </span>
                  </div>
                  <Progress value={stats?.invoicesPaid || 0} className="h-3 bg-emerald-100" />
                  <div className="text-xs text-emerald-600 font-medium mt-2">{stats?.invoicesPaid || 0}% collected</div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
                  <span className="text-sm font-medium text-gray-600">Overdue</span>
                  <span className="font-bold text-rose-700 text-lg">
                    ${stats?.revenueOverdue?.toLocaleString() || 0}
                  </span>
                </div>

                {(stats?.overdueCount || 0) > 0 && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-900">{stats?.overdueCount} families overdue</p>
                      <p className="text-xs text-amber-600">Reminders pending</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg"
                  >
                    Go to Billing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-purple-200 hover:bg-purple-50 bg-transparent"
                  >
                    Send Reminders
                  </Button>
                </div>
              </div>
            )}
          </Section>

          <Section title="Engagement" description="Messages and media activity">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-purple-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid gap-2">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all border border-transparent hover:border-emerald-200 group">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-sm flex-1 font-medium text-gray-700">New parent messages</span>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                    {stats?.newMessages || 0}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all border border-transparent hover:border-blue-200 group">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 group-hover:scale-110 transition-transform">
                    <Camera className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm flex-1 font-medium text-gray-700">Photos shared today</span>
                  <div className="font-bold text-blue-600">{stats?.photosToday || 0}</div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all border border-transparent hover:border-purple-200 group">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 group-hover:scale-110 transition-transform">
                    <CalendarDays className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-sm flex-1 font-medium text-gray-700">Upcoming events this week</span>
                  <div className="font-bold text-purple-600">{stats?.upcomingEvents || 0}</div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 bg-transparent"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Messages
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 bg-transparent"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Media
                  </Button>
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>
    </AppShell>
  )
}
