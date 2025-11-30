"use client"

import { useEffect, useState } from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent } from "../components/ui/card"
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Target,
  Shield,
  Award,
  Sparkles,
  Trash2,
  UserCheck,
  LogOut,
  Clock,
} from "lucide-react"
import { Badge } from "../components/ui/badge"
import { exportCsv } from "../CSV/export-csv"

/* ----------------------------- Types ----------------------------- */

interface ChildRecord {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  fullName?: string
}

interface AttendanceRecord {
  id: string
  childId?: string
  childName: string
  date: string
  status: string
  checkIn?: string | null
  checkOut?: string | null
  child?: ChildRecord
}

interface BillingRecord {
  id: string
  family: string
  amount: number
  status: string
  dueDate: string
}

interface HealthRecord {
  id: string
  childId?: string
  childName: string
  type: string
  date: string
  notes: string
  child?: ChildRecord
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  role: "teacher" | "assistant" | "director" | "staff" | string
  status?: "active" | "inactive" | "on_leave" | string
}

interface StaffToday {
  status: "in" | "out" | null
  checkIn?: string
  checkOut?: string
}

interface ReportStats {
  attendance: {
    totalRecords: number
    presentCount: number
    absentCount: number
    attendanceRate: number
  }
  revenue: {
    totalCollected: number
    totalOutstanding: number
    collectionRate: number
  }
  health: {
    totalMilestones: number
    uniqueChildren: number
    avgPerChild: number
  }
  staff: {
    totalStaff: number
    checkedIn: number
    checkedOut: number
    notMarked: number
  }
}

/* --------------------------- Helpers --------------------------- */

const STAFF_API = "http://localhost:8080/staff"
const STAFF_ATT_API = "http://localhost:8080/attendance/staff"

// robustly compute a display child name
const resolveChildName = (
  record: { childName?: string | null; childId?: string; child?: ChildRecord | null },
  childMap: Map<string, ChildRecord>,
): string => {
  if (record.childName && record.childName !== "null") return record.childName

  const child = record.child || (record.childId ? childMap.get(record.childId) : undefined)
  if (child) {
    if (child.fullName && child.fullName !== "null") return child.fullName
    if (child.name && child.name !== "null") return child.name
    const parts = [child.firstName, child.lastName].filter(Boolean)
    if (parts.length) return parts.join(" ")
  }

  return "Unknown"
}

// normalize time value to "HH:MM" (or undefined)
const normalizeTime = (value?: string | null): string | undefined => {
  if (!value) return undefined
  // backend uses "HH:MM:SS" – but be safe
  if (value.length >= 5) return value.slice(0, 5)
  return value
}

/* ----------------------------- Component ----------------------------- */

export default function Reports() {
  const [tab, setTab] = useState("attendance")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [billingData, setBillingData] = useState<BillingRecord[]>([])
  const [healthData, setHealthData] = useState<HealthRecord[]>([])
  const [childrenData, setChildrenData] = useState<ChildRecord[]>([])
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [staffTodayMap, setStaffTodayMap] = useState<Record<string, StaffToday>>({})

  const [stats, setStats] = useState<ReportStats>({
    attendance: { totalRecords: 0, presentCount: 0, absentCount: 0, attendanceRate: 0 },
    revenue: { totalCollected: 0, totalOutstanding: 0, collectionRate: 0 },
    health: { totalMilestones: 0, uniqueChildren: 0, avgPerChild: 0 },
    staff: { totalStaff: 0, checkedIn: 0, checkedOut: 0, notMarked: 0 },
  })

  const [deletingAttendanceId, setDeletingAttendanceId] = useState<string | null>(null)
  const [deletingBillingId, setDeletingBillingId] = useState<string | null>(null)

  const fetchReportsData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    setError(null)

    try {
      const [attendanceRes, billingRes, healthRes, childrenRes, staffRes] = await Promise.all([
        fetch("http://localhost:8080/attendance"),
        fetch("http://localhost:8080/billing"),
        fetch("http://localhost:8080/health"),
        fetch("http://localhost:8080/children"),
        fetch(STAFF_API),
      ])

      if (!attendanceRes.ok || !billingRes.ok || !healthRes.ok || !childrenRes.ok || !staffRes.ok) {
        throw new Error("Failed to fetch reports data")
      }

      const [attendanceRaw, billingRaw, healthRaw, childrenRaw, staffRaw] = await Promise.all([
        attendanceRes.json(),
        billingRes.json(),
        healthRes.json(),
        childrenRes.json(),
        staffRes.json(),
      ])

      /* ---- children map ---- */
      const children: ChildRecord[] = childrenRaw
      setChildrenData(children)

      const childMap = new Map<string, ChildRecord>()
      children.forEach((c) => {
        if (!c.id) return
        const fullName =
          c.fullName || c.name || [c.firstName, c.lastName].filter(Boolean).join(" ") || undefined
        childMap.set(c.id, { ...c, fullName })
      })

      /* ---- attendance mapping (key fix for checkIn/checkOut) ---- */
      const attendance: AttendanceRecord[] = (attendanceRaw as any[]).map((a) => {
        // a.checkIn / a.checkOut from backend are "HH:MM:SS" (nullable)
        const rawIn =
          a.checkIn ??
          a.check_in ??
          a.checkin ??
          a.check_in_time ??
          a.in ??
          a.start ??
          a.clockIn ??
          null
        const rawOut =
          a.checkOut ??
          a.check_out ??
          a.checkout ??
          a.check_out_time ??
          a.out ??
          a.end ??
          a.clockOut ??
          null

        return {
          ...a,
          childName: resolveChildName(a, childMap),
          checkIn: normalizeTime(rawIn),
          checkOut: normalizeTime(rawOut),
        }
      })

      /* ---- health mapping (keep names consistent) ---- */
      const health: HealthRecord[] = (healthRaw as any[]).map((h) => ({
        ...h,
        childName: resolveChildName(h, childMap),
      }))

      const billing: BillingRecord[] = billingRaw
      const staff: StaffMember[] = staffRaw

      setAttendanceData(attendance)
      setBillingData(billing)
      setHealthData(health)
      setStaffList(staff)

      /* ---- staff today map ---- */
      const staffToday: Record<string, StaffToday> = {}
      await Promise.all(
        staff.map(async (member) => {
          try {
            const resp = await fetch(`${STAFF_ATT_API}/${member.id}/today`)
            if (!resp.ok) {
              staffToday[member.id] = { status: null }
              return
            }
            const data = await resp.json()
            staffToday[member.id] = {
              status: data.status,
              checkIn: normalizeTime(data.checkIn),
              checkOut: normalizeTime(data.checkOut),
            }
          } catch {
            staffToday[member.id] = { status: null }
          }
        }),
      )
      setStaffTodayMap(staffToday)

      /* ---- attendance stats ---- */
      const presentCount = attendance.filter((a) => a.status === "present").length
      const absentCount = attendance.filter((a) => a.status === "absent" || a.status === "away").length
      const totalRecords = attendance.length
      const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0

      /* ---- revenue stats ---- */
      const totalCollected = billing
        .filter((b) => b.status === "paid")
        .reduce((sum, b) => sum + b.amount, 0)
      const totalOutstanding = billing
        .filter((b) => b.status !== "paid")
        .reduce((sum, b) => sum + b.amount, 0)
      const totalRevenue = totalCollected + totalOutstanding
      const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0

      /* ---- health stats ---- */
      const uniqueChildren = new Set(health.map((h) => h.childName)).size
      const totalMilestones = health.length
      const avgPerChild = uniqueChildren > 0 ? totalMilestones / uniqueChildren : 0

      /* ---- staff stats ---- */
      const totalStaff = staff.length
      let checkedIn = 0
      let checkedOut = 0
      let notMarked = 0
      staff.forEach((member) => {
        const t = staffToday[member.id]
        if (!t || t.status === null) notMarked++
        else if (t.status === "in") checkedIn++
        else checkedOut++
      })

      setStats({
        attendance: { totalRecords, presentCount, absentCount, attendanceRate },
        revenue: { totalCollected, totalOutstanding, collectionRate },
        health: { totalMilestones, uniqueChildren, avgPerChild },
        staff: { totalStaff, checkedIn, checkedOut, notMarked },
      })
    } catch (err) {
      console.error("[Reports] Error:", err)
      setError("Failed to load reports data. Please check your connection.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReportsData()
  }, [])

  /* ---------------------- Delete handlers ---------------------- */

  const handleDeleteAttendance = async (id: string) => {
    try {
      setDeletingAttendanceId(id)
      const res = await fetch(`http://localhost:8080/attendance/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete attendance record")
      setAttendanceData((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to delete attendance record.")
    } finally {
      setDeletingAttendanceId(null)
    }
  }

  const handleDeleteBilling = async (id: string) => {
    try {
      setDeletingBillingId(id)
      const res = await fetch(`http://localhost:8080/billing/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete billing record")
      setBillingData((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to delete billing record.")
    } finally {
      setDeletingBillingId(null)
    }
  }

  /* ---------------------- Export helpers ---------------------- */

  const formatAttendanceForExport = () => {
    const headers = ["Date", "Child Name", "Status", "Check-in", "Check-out"]
    const rows = attendanceData.map((record) => [
      record.date,
      record.childName,
      record.status,
      record.checkIn || "N/A",
      record.checkOut || "N/A",
    ])
    return [headers, ...rows]
  }

  const formatBillingForExport = () => {
    const headers = ["Family", "Amount", "Status", "Due Date"]
    const rows = billingData.map((record) => [record.family, record.amount.toString(), record.status, record.dueDate])
    return [headers, ...rows]
  }

  const formatHealthForExport = () => {
    const headers = ["Child Name", "Type", "Date", "Notes"]
    const rows = healthData.map((record) => [record.childName, record.type, record.date, record.notes])
    return [headers, ...rows]
  }

  const formatStaffAttendanceForExport = () => {
    const headers = ["Staff Name", "Role", "Status (Today)", "Check-in", "Check-out"]
    const rows = staffList.map((member) => {
      const today = staffTodayMap[member.id]
      const statusLabel =
        today?.status === "in" ? "in" : today?.status === "out" ? "out" : "not_marked"
      return [
        `${member.firstName} ${member.lastName}`,
        member.role,
        statusLabel,
        today?.checkIn || "N/A",
        today?.checkOut || "N/A",
      ]
    })
    return [headers, ...rows]
  }

  /* ---------------------- PDF generator ---------------------- */

  const generatePDF = (data: (string | number)[][], title: string) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 40px 20px;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 30px 60px rgba(0,0,0,0.2);
              max-width: 1200px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 30px;
              border-bottom: 4px solid #667eea;
              position: relative;
            }
            .header::after {
              content: '';
              position: absolute;
              bottom: -4px;
              left: 50%;
              transform: translateX(-50%);
              width: 200px;
              height: 4px;
              background: linear-gradient(90deg, #667eea, #764ba2);
              border-radius: 2px;
            }
            .header h1 {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-size: 42px;
              font-weight: 800;
              margin-bottom: 12px;
              letter-spacing: -1px;
            }
            .header p {
              color: #666;
              font-size: 18px;
              font-weight: 500;
            }
            .stats {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin: 30px 0 40px;
            }
            .stat-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 25px;
              border-radius: 15px;
              text-align: center;
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            }
            .stat-number {
              font-size: 36px;
              font-weight: 800;
              margin-bottom: 8px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .stat-label {
              font-size: 14px;
              opacity: 0.95;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            table { 
              width: 100%; 
              border-collapse: separate;
              border-spacing: 0;
              margin-top: 30px;
              background: white;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            th { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 18px 20px;
              text-align: left;
              font-weight: 700;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            td { 
              padding: 16px 20px;
              border-bottom: 1px solid #f0f0f0;
              font-size: 14px;
              color: #333;
            }
            tr:last-child td {
              border-bottom: none;
            }
            tr:nth-child(even) { 
              background-color: #f8f9ff; 
            }
            tr:hover {
              background-color: #e8f0fe;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px solid #f0f0f0;
              color: #888;
              font-size: 13px;
            }
            .footer p {
              margin: 8px 0;
            }
            .footer strong {
              color: #667eea;
              font-weight: 600;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .badge-success {
              background: #10b981;
              color: white;
            }
            .badge-warning {
              background: #f59e0b;
              color: white;
            }
            .badge-danger {
              background: #ef4444;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 ${title} Report</h1>
              <p>Generated on ${new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })} at ${new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}</p>
            </div>
            
            ${
              title === "Attendance"
                ? `
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-number">${stats.attendance.totalRecords}</div>
                  <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.attendance.presentCount}</div>
                  <div class="stat-label">Present</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.attendance.absentCount}</div>
                  <div class="stat-label">Absent</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.attendance.attendanceRate.toFixed(1)}%</div>
                  <div class="stat-label">Attendance Rate</div>
                </div>
              </div>
            `
                : ""
            }
            
            ${
              title === "Revenue"
                ? `
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-number">$${stats.revenue.totalCollected.toLocaleString()}</div>
                  <div class="stat-label">Total Collected</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">$${stats.revenue.totalOutstanding.toLocaleString()}</div>
                  <div class="stat-label">Outstanding</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.revenue.collectionRate.toFixed(1)}%</div>
                  <div class="stat-label">Collection Rate</div>
                </div>
              </div>
            `
                : ""
            }
            
            ${
              title === "Health & Development"
                ? `
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-number">${stats.health.totalMilestones}</div>
                  <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.health.uniqueChildren}</div>
                  <div class="stat-label">Children Tracked</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.health.avgPerChild.toFixed(1)}</div>
                  <div class="stat-label">Avg per Child</div>
                </div>
              </div>
            `
                : ""
            }

            ${
              title === "Staff Attendance"
                ? `
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-number">${stats.staff.totalStaff}</div>
                  <div class="stat-label">Total Staff</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.staff.checkedIn}</div>
                  <div class="stat-label">Checked In</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.staff.checkedOut}</div>
                  <div class="stat-label">Checked Out</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.staff.notMarked}</div>
                  <div class="stat-label">Not Marked</div>
                </div>
              </div>
            `
                : ""
            }
            
            <table>
              <thead>
                <tr>
                  ${data[0].map((header) => `<th>${header}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${data
                  .slice(1)
                  .map(
                    (row) => `
                  <tr>
                    ${row
                      .map(
                        (cell, index) => `
                      <td>${
                        title === "Attendance" && index === 2
                          ? `<span class="badge ${
                              cell === "present" ? "badge-success" : "badge-danger"
                            }">${cell}</span>`
                          : title === "Revenue" && index === 2
                            ? `<span class="badge ${
                                cell === "paid"
                                  ? "badge-success"
                                  : cell === "overdue"
                                    ? "badge-danger"
                                    : "badge-warning"
                              }">${cell}</span>`
                            : cell
                      }</td>
                    `,
                      )
                      .join("")}
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="footer">
              <p><strong>Childcare Management System</strong></p>
              <p>This report was automatically generated and contains confidential information</p>
              <p>© ${new Date().getFullYear()} - All rights reserved</p>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    }
  }

  /* ------------------------- Error UI ------------------------- */

  if (error) {
    return (
      <AppShell title="Reports & Analytics">
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Failed to Load Reports</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <Button
              onClick={() => fetchReportsData()}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  /* ------------------------- Main UI ------------------------- */

  return (
    <AppShell title="Reports & Analytics">
      {/* Hero header (same as before) */}
      <div className="relative overflow-hidden rounded-3xl border-0 shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600" />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-pink-500/20 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute top-8 right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-bounce" />
        <div className="absolute bottom-8 left-12 w-24 h-24 bg-purple-300/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-pink-300/10 rounded-full blur-xl animate-bounce delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative p-10 md:p-12 text-white">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 animate-bounce">
                <BarChart3 className="h-8 w-8 drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3 drop-shadow-2xl">
                  Reports & Analytics
                </h1>
                <p className="text-xl text-white/95 font-medium mb-4">
                  Comprehensive insights with real-time data visualization
                </p>
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-semibold">Live Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <span className="text-sm font-semibold">Smart Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-semibold">Secure Export</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => fetchReportsData(true)}
              disabled={refreshing}
              className="bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 text-white shadow-xl"
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-md">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              </Badge>
            </div>
            <p className="text-sm text-white/90 font-semibold mb-1">Attendance Rate</p>
            <p className="text-4xl font-black text-white drop-shadow-lg">
              {loading ? "..." : `${stats.attendance.attendanceRate.toFixed(1)}%`}
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-md">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
              </Badge>
            </div>
            <p className="text-sm text-white/90 font-semibold mb-1">Revenue Collected</p>
            <p className="text-4xl font-black text-white drop-shadow-lg">
              {loading ? "..." : `$${stats.revenue.totalCollected.toLocaleString()}`}
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <Award className="h-7 w-7 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-md">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              </Badge>
            </div>
            <p className="text-sm text-white/90 font-semibold mb-1">Health Records</p>
            <p className="text-4xl font-black text-white drop-shadow-lg">
              {loading ? "..." : stats.health.totalMilestones}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Children attendance, Staff, Revenue, Development */}
      <Tabs defaultValue="attendance" value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8 h-16 bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-100 rounded-2xl p-2 shadow-lg">
          <TabsTrigger value="attendance">
            <Activity className="h-5 w-5 mr-2" />
            <span className="font-bold">Children</span>
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="h-5 w-5 mr-2" />
            <span className="font-bold">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="h-5 w-5 mr-2" />
            <span className="font-bold">Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="development">
            <TrendingUp className="h-5 w-5 mr-2" />
            <span className="font-bold">Development</span>
          </TabsTrigger>
        </TabsList>

        {/* CHILD ATTENDANCE TAB */}
        <TabsContent value="attendance" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Records",
                value: stats.attendance.totalRecords,
                icon: Users,
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                label: "Present",
                value: stats.attendance.presentCount,
                icon: CheckCircle2,
                gradient: "from-green-500 to-emerald-500",
              },
              {
                label: "Absent",
                value: stats.attendance.absentCount,
                icon: Calendar,
                gradient: "from-red-500 to-rose-500",
              },
              {
                label: "Rate",
                value: `${stats.attendance.attendanceRate.toFixed(1)}%`,
                icon: PieChart,
                gradient: "from-purple-500 to-pink-500",
              },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
                  />
                  <CardContent className="relative p-6 text-center">
                    <Icon
                      className={`h-10 w-10 mx-auto mb-3 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    />
                    <p className="text-3xl font-black text-gray-800 mb-1">
                      {loading ? <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" /> : stat.value}
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportCsv("attendance-report.csv", formatAttendanceForExport())}
              disabled={loading}
              className="border-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => generatePDF(formatAttendanceForExport(), "Attendance")}
              disabled={loading}
              className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white border-0 shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Section title="Attendance Records" description="Detailed attendance tracking with check-in/out times">
            <div className="rounded-2xl border-2 border-violet-100 bg-white shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-violet-500 mb-4" />
                  <p className="text-gray-600 font-medium">Loading attendance data...</p>
                </div>
              ) : attendanceData.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mb-4">
                    <Activity className="h-8 w-8 text-violet-600" />
                  </div>
                  <p className="text-gray-600 font-medium">No attendance records found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b-2 border-violet-200">
                      <TableHead className="font-bold text-gray-800">Date</TableHead>
                      <TableHead className="font-bold text-gray-800">Child Name</TableHead>
                      <TableHead className="font-bold text-gray-800">Status</TableHead>
                      <TableHead className="font-bold text-gray-800">Check-in</TableHead>
                      <TableHead className="font-bold text-gray-800">Check-out</TableHead>
                      <TableHead className="font-bold text-gray-800 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((record, index) => (
                      <TableRow
                        key={record.id}
                        className={`hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <TableCell className="font-medium text-gray-800">{record.date}</TableCell>
                        <TableCell className="font-semibold text-gray-900">{record.childName}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              record.status === "present"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : "bg-gradient-to-r from-red-500 to-rose-500"
                            } text-white border-0 shadow-md`}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">{record.checkIn || "N/A"}</TableCell>
                        <TableCell className="text-gray-700">{record.checkOut || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDeleteAttendance(record.id)}
                            disabled={deletingAttendanceId === record.id}
                          >
                            {deletingAttendanceId === record.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Section>
        </TabsContent>

        {/* STAFF ATTENDANCE TAB */}
        <TabsContent value="staff" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Staff",
                value: stats.staff.totalStaff,
                icon: Users,
                gradient: "from-blue-500 to-indigo-500",
              },
              {
                label: "Checked In",
                value: stats.staff.checkedIn,
                icon: UserCheck,
                gradient: "from-emerald-500 to-green-500",
              },
              {
                label: "Checked Out",
                value: stats.staff.checkedOut,
                icon: LogOut,
                gradient: "from-slate-500 to-slate-700",
              },
              {
                label: "Not Marked",
                value: stats.staff.notMarked,
                icon: Clock,
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
                  />
                  <CardContent className="relative p-6 text-center">
                    <Icon
                      className={`h-10 w-10 mx-auto mb-3 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    />
                    <p className="text-3xl font-black text-gray-800 mb-1">
                      {loading ? <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" /> : stat.value}
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportCsv("staff-attendance-today.csv", formatStaffAttendanceForExport())}
              disabled={loading}
              className="border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => generatePDF(formatStaffAttendanceForExport(), "Staff Attendance")}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Section
            title="Staff Attendance Today"
            description="Overview of today’s check-ins and check-outs for all staff members."
          >
            <div className="rounded-2xl border-2 border-indigo-100 bg-white shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-indigo-500 mb-4" />
                  <p className="text-gray-600 font-medium">Loading staff attendance...</p>
                </div>
              ) : staffList.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 mb-4">
                    <Users className="h-8 w-8 text-indigo-600" />
                  </div>
                  <p className="text-gray-600 font-medium">No staff members found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b-2 border-indigo-200">
                      <TableHead className="font-bold text-gray-800">Staff Member</TableHead>
                      <TableHead className="font-bold text-gray-800">Role</TableHead>
                      <TableHead className="font-bold text-gray-800">Status (Today)</TableHead>
                      <TableHead className="font-bold text-gray-800">Check-in</TableHead>
                      <TableHead className="font-bold text-gray-800">Check-out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((member, index) => {
                      const today = staffTodayMap[member.id]
                      const status = today?.status ?? null

                      return (
                        <TableRow
                          key={member.id}
                          className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <TableCell className="font-semibold text-gray-900">
                            {member.firstName} {member.lastName}
                          </TableCell>
                          <TableCell className="text-gray-700 capitalize">{member.role}</TableCell>
                          <TableCell>
                            {status === "in" ? (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-md">
                                In
                              </Badge>
                            ) : status === "out" ? (
                              <Badge className="bg-gradient-to-r from-slate-500 to-slate-700 text-white border-0 shadow-md">
                                Out
                              </Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 border-0 shadow-md">
                                Not marked
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {today?.checkIn ? today.checkIn : "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {today?.checkOut ? today.checkOut : "N/A"}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </Section>
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Total Collected",
                value: `$${stats.revenue.totalCollected.toLocaleString()}`,
                icon: DollarSign,
                gradient: "from-green-500 to-emerald-500",
              },
              {
                label: "Outstanding",
                value: `$${stats.revenue.totalOutstanding.toLocaleString()}`,
                icon: TrendingUp,
                gradient: "from-orange-500 to-red-500",
              },
              {
                label: "Collection Rate",
                value: `${stats.revenue.collectionRate.toFixed(1)}%`,
                icon: BarChart3,
                gradient: "from-blue-500 to-cyan-500",
              },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
                  />
                  <CardContent className="relative p-6 text-center">
                    <Icon
                      className={`h-10 w-10 mx-auto mb-3 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    />
                    <p className="text-3xl font-black text-gray-800 mb-1">
                      {loading ? <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" /> : stat.value}
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportCsv("revenue-report.csv", formatBillingForExport())}
              disabled={loading}
              className="border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => generatePDF(formatBillingForExport(), "Revenue")}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white border-0 shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Section title="Billing Records" description="Revenue tracking and payment status">
            <div className="rounded-2xl border-2 border-emerald-100 bg-white shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-emerald-500 mb-4" />
                  <p className="text-gray-600 font-medium">Loading billing data...</p>
                </div>
              ) : billingData.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 mb-4">
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-gray-600 font-medium">No billing records found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-b-2 border-emerald-200">
                      <TableHead className="font-bold text-gray-800">Family</TableHead>
                      <TableHead className="font-bold text-gray-800">Amount</TableHead>
                      <TableHead className="font-bold text-gray-800">Status</TableHead>
                      <TableHead className="font-bold text-gray-800">Due Date</TableHead>
                      <TableHead className="font-bold text-gray-800 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.map((record, index) => (
                      <TableRow
                        key={record.id}
                        className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <TableCell className="font-semibold text-gray-900">{record.family}</TableCell>
                        <TableCell className="font-mono text-lg font-bold text-emerald-700">
                          ${record.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              record.status === "paid"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : record.status === "overdue"
                                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                                  : "bg-gradient-to-r from-amber-500 to-orange-500"
                            } text-white border-0 shadow-md`}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">{record.dueDate}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDeleteBilling(record.id)}
                            disabled={deletingBillingId === record.id}
                          >
                            {deletingBillingId === record.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}
