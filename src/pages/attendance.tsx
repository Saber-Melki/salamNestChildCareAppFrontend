"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { CheckSquare, Users, TrendingUp, Clock, UserCheck, Search, X, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { fetchChildren, type ChildRow } from "../services/child.service"
import { AppShell, Section } from "../components/app-shell"
import { cn } from "../lib/utils"

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
  const [viewMode, setViewMode] = useState<"all" | "present" | "away">("all")

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

  // Apply filters
  const visibleRows = enrichedRows
    .filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
    .filter((r) => {
      if (viewMode === "all") return true
      return r.status === viewMode
    })

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
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-700 opacity-95" />
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

        {/* Animated decorative elements */}
        <div className="absolute top-8 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/5 rounded-full blur-xl animate-bounce" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse animation-delay-1000" />

        <div className="relative p-8 md:p-10 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl">
                <CheckSquare className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 drop-shadow-lg">
                  Attendance Tracking
                </h1>
                <p className="text-white/95 text-lg font-medium">Real-time check-in/out system with instant updates</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                <div className="text-sm text-white/80 mb-1">Current Time</div>
                <div className="text-2xl font-bold">{nowTime()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100 dark:from-emerald-950 dark:via-emerald-900 dark:to-teal-950 overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Total Children</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                  {totalCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 dark:from-green-950 dark:via-green-900 dark:to-emerald-950 overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Present Today</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 dark:from-green-300 dark:to-emerald-300 bg-clip-text text-transparent">
                  {presentCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 dark:from-blue-950 dark:via-blue-900 dark:to-cyan-950 overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Attendance Rate</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
                  {attendanceRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl bg-gradient-to-br from-rose-50 via-rose-100 to-pink-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Absent Today</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-rose-700 to-pink-700 dark:from-rose-300 dark:to-pink-300 bg-clip-text text-transparent">
                  {totalCount - presentCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Section title="Children Attendance" description="Quick check-in and check-out system">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <Input
                id="search"
                placeholder="Search children by name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500 rounded-xl h-12 shadow-md"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Button
                  size="sm"
                  onClick={() => setViewMode("all")}
                  className={cn(
                    "rounded-lg transition-all duration-300",
                    viewMode === "all"
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-black shadow-lg"
                      : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  All ({totalCount})
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewMode("present")}
                  className={cn(
                    "rounded-lg transition-all duration-300",
                    viewMode === "present"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  Present ({presentCount})
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewMode("away")}
                  className={cn(
                    "rounded-lg transition-all duration-300",
                    viewMode === "away"
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                      : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  Away ({totalCount - presentCount})
                </Button>
              </div>

              <Button
                onClick={loadData}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg rounded-xl h-12"
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-xl animate-pulse bg-gray-100 dark:bg-gray-800 h-64" />
              ))}
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <p className="text-lg text-gray-500 dark:text-gray-400">No children found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleRows.map((r) => {
                const isPresent = r.status === "present"
                return (
                  <Card
                    key={r.childId}
                    className={cn(
                      "border-2 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-300 relative",
                      isPresent
                        ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 border-green-300 dark:border-green-700"
                        : "bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-700",
                    )}
                  >
                    {/* Status indicator */}
                    <div
                      className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r"
                      style={{
                        backgroundImage: isPresent
                          ? "linear-gradient(to right, rgb(34 197 94), rgb(16 185 129))"
                          : "linear-gradient(to right, rgb(156 163 175), rgb(107 114 128))",
                      }}
                    />

                    <CardContent className="p-6">
                      <br></br>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <div
                            className={cn(
                              "absolute -inset-1 rounded-full blur-lg opacity-75 transition-opacity",
                              isPresent ? "bg-gradient-to-r from-green-400 to-emerald-400" : "bg-gray-400",
                            )}
                          />
                          <img
                            src="/child.jpg"
                            alt={r.name}
                            width={64}
                            height={64}
                            className="relative rounded-full shadow-xl ring-4 ring-white dark:ring-green-800"
                          />
                          {isPresent && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg ring-4 ring-white dark:ring-gray-800">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{r.name}</h3>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full animate-pulse",
                                isPresent ? "bg-green-500" : "bg-gray-400",
                              )}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{r.group}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        {isPresent ? (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg text-sm px-3 py-1">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Present
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-2 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm px-3 py-1"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Away
                          </Badge>
                        )}
                      </div>

                      {/* Time Information */}
                      <div className="space-y-2 mb-4 bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Check-in:</span>
                          <div className="flex items-center gap-1">
                            {r.checkIn && <Clock className="h-3 w-3 text-green-600 dark:text-green-400" />}
                            <span
                              className={cn(
                                "font-semibold",
                                r.checkIn ? "text-green-700 dark:text-green-300" : "text-gray-400 dark:text-gray-600",
                              )}
                            >
                              {r.checkIn || "00:00:00"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Check-out:</span>
                          <div className="flex items-center gap-1">
                            {r.checkOut && <Clock className="h-3 w-3 text-rose-600 dark:text-rose-400" />}
                            <span
                              className={cn(
                                "font-semibold",
                                r.checkOut ? "text-rose-700 dark:text-rose-300" : "text-gray-400 dark:text-gray-600",
                              )}
                            >
                              {r.checkOut || "00:00:00"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCheck(r.childId, r.attendanceId, "in")}
                          disabled={isPresent}
                          className={cn(
                            "rounded-xl transition-all duration-300",
                            isPresent
                              ? "opacity-50 cursor-not-allowed"
                              : "border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950 shadow-md hover:shadow-lg",
                          )}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onCheck(r.childId, r.attendanceId, "out")}
                          disabled={!isPresent}
                          className={cn(
                            "rounded-xl transition-all duration-300",
                            !isPresent
                              ? "opacity-50 cursor-not-allowed"
                              : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg",
                          )}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Check Out
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </Section>
      </div>
    </AppShell>
  )
}
