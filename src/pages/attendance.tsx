"use client"

import { useEffect, useState, useMemo } from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { CheckSquare, Users, TrendingUp, Clock, UserCheck, Search } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { fetchChildren, type ChildRow } from "../services/child.service"

// ----------------- API DIRECT -----------------
export type AttendanceRow = {
  id: string
  childId: string
  date: string // YYYY-MM-DD
  status: "present" | "away"
  checkIn?: string // HH:MM
  checkOut?: string // HH:MM
}

const API_URL = "http://localhost:8080/attendance"

const fetchAttendance = async (): Promise<AttendanceRow[]> => {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error("Failed to fetch attendance")
  return res.json()
}

const updateAttendance = async (id: string, payload: Partial<AttendanceRow>) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Failed to update attendance: ${res.status} ${txt}`)
  }
  return res.json()
}

const createAttendance = async (payload: Partial<AttendanceRow>) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Failed to create attendance: ${res.status} ${txt}`)
  }
  return res.json()
}
// ------------------------------------------------

type EnrichedRow = {
  childId: string
  attendanceId?: string
  name: string
  group: string
  status: "present" | "away"
  checkIn?: string
  checkOut?: string
}

export default function Attendance() {
  const [children, setChildren] = useState<ChildRow[]>([])
  const [attendance, setAttendance] = useState<AttendanceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  const todayDate = () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const nowTime = () => new Date().toTimeString().slice(0, 5) // HH:MM

  const loadData = async () => {
    try {
      setLoading(true)
      const [ch, att] = await Promise.all([fetchChildren(), fetchAttendance()])
      setChildren(ch)
      setAttendance(att)
    } catch (err) {
      console.error("❌ Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Map attendance by child for TODAY only
  const attMapForToday = useMemo(() => {
    const map = new Map<string, AttendanceRow>()
    const today = todayDate()
    attendance.forEach((a) => {
      if (!a.date) return
      if (a.date.slice(0, 10) === today) map.set(a.childId, a)
    })
    return map
  }, [attendance])

  // Build rows from children
  const enrichedRows: EnrichedRow[] = useMemo(() => {
    return children.map((c) => {
      const att = attMapForToday.get(c.id)
      return {
        childId: c.id,
        attendanceId: att?.id,
        name: `${c.firstName} ${c.lastName}`,
        group: c.group || "-",
        status: att?.status || "away",
        checkIn: att?.checkIn,
        checkOut: att?.checkOut,
      }
    })
  }, [children, attMapForToday])

  const visibleRows = enrichedRows.filter((r) =>
    r.name.toLowerCase().includes(filter.toLowerCase())
  )

  // Stats
  const presentCount = enrichedRows.filter((r) => r.status === "present").length
  const totalCount = enrichedRows.length
  const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : "0"

  // Handle check-in / check-out
  const onCheck = async (childId: string, attendanceId: string | undefined, type: "in" | "out") => {
    try {
      const time = nowTime()
      const date = todayDate()

      if (attendanceId) {
        const payload: Partial<AttendanceRow> = {
          status: type === "in" ? "present" : "away",
          checkIn: type === "in" ? time : undefined,
          checkOut: type === "out" ? time : undefined,
        }
        await updateAttendance(attendanceId, payload)
      } else {
        const payload: Partial<AttendanceRow> = {
          childId,
          date,
          status: type === "in" ? "present" : "away",
          checkIn: type === "in" ? time : undefined,
          checkOut: type === "out" ? time : undefined,
        }
        await createAttendance(payload)
      }

      await loadData()
    } catch (err) {
      console.error("Attendance update/create failed:", err)
    }
  }

  return (
    <AppShell title="Attendance Tracking">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border shadow-lg mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 opacity-90" />
        <div className="absolute inset-0">
          <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute bottom-6 left-6 w-20 h-20 bg-white/5 rounded-full animate-bounce" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500" />
        </div>
        <div className="relative p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">Attendance Tracking</h1>
              <p className="text-white/90 text-lg">Track children's attendance with precision and ease</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-emerald-700">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-700">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-700">{attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Time</p>
                <p className="text-lg font-bold text-purple-700">{nowTime()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Section title="Check-in / Check-out" description="Record attendance for children with precise timestamps.">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search children..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <Button
              onClick={loadData}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg"
            >
              <Clock className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading attendance data...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50">
                    <TableHead className="font-semibold text-gray-800">Name</TableHead>
                    <TableHead className="font-semibold text-gray-800">Group</TableHead>
                    <TableHead className="font-semibold text-gray-800">Status</TableHead>
                    <TableHead className="font-semibold text-gray-800">Check-in</TableHead>
                    <TableHead className="font-semibold text-gray-800">Check-out</TableHead>
                    <TableHead className="w-[220px] font-semibold text-gray-800">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.map((r, index) => (
                    <TableRow
                      key={r.childId}
                      className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                    >
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <img
                            src="/child.jpg"
                            alt="Child avatar"
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <span>{r.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                          {r.group}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.status === "present" ? (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Present
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-300 text-red-600">
                            Away
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {r.checkIn && <Clock className="h-3 w-3 text-green-600" />}
                          <span className={r.checkIn ? "text-green-700 font-medium" : "text-gray-400"}>
                            {r.checkIn || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {r.checkOut && <Clock className="h-3 w-3 text-red-600" />}
                          <span className={r.checkOut ? "text-red-700 font-medium" : "text-gray-400"}>
                            {r.checkOut || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => onCheck(r.childId, r.attendanceId, "in")}
                            disabled={r.status === "present"}
                            className="border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Check-in
                          </Button>

                          <Button
                            onClick={() => onCheck(r.childId, r.attendanceId, "out")}
                            disabled={r.status === "away"}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 disabled:opacity-50"
                          >
                            Check-out
                          </Button>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Section>
      </div>
    </AppShell>
  )
}
