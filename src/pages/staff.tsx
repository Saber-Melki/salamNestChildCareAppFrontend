"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Textarea } from "../components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  Award,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Filter,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  CheckCircle,
  LogIn,
  LogOut,
} from "lucide-react"

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: "teacher" | "assistant" | "director" | "staff"
  status: "active" | "inactive" | "on_leave"
  hireDate: string
  address: string
  emergencyContact: { name: string; phone: string }
  certifications: string[]
  hourlyRate: number
  weeklyHours: number
  notes: string
  avatar?: string
}

type StaffAttendanceToday = {
  status: "in" | "out" | null
  checkIn?: string
  checkOut?: string
}

const STAFF_API = "http://localhost:8080/staff"
const STAFF_ATT_API = "http://localhost:8080/attendance/staff" // REST in attendance service

const ROLE_COLORS = {
  director: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  teacher: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
  assistant: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
  staff: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
}

const STATUS_COLORS = {
  active: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
  inactive: "bg-gradient-to-r from-red-500 to-rose-500 text-white",
  on_leave: "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
}

/* ────────────────────────── Helper: parse backend shapes ────────────────────────── */
function extractTimes(resp: any) {
  const r = resp ?? {}
  const src = r.attendance ?? r.data ?? r.result ?? r
  const checkIn =
    src.checkIn ??
    src.check_in ??
    src.checkin ??
    src.check_in_time ??
    src.in ??
    src.start ??
    src.clockIn ??
    undefined
  const checkOut =
    src.checkOut ??
    src.check_out ??
    src.checkout ??
    src.check_out_time ??
    src.out ??
    src.end ??
    src.clockOut ??
    undefined
  return { checkIn, checkOut }
}

/* ────────────────────────── Helper: Presence Pill ────────────────────────── */
function PresencePill({
  s,
  inTime,
  outTime,
}: {
  s: "in" | "out" | null | undefined
  inTime?: string
  outTime?: string
}) {
  if (s === "in") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
        <CheckCircle className="h-3.5 w-3.5" />
        In {inTime ? inTime.slice(0, 5) : ""}
      </span>
    )
  }
  if (s === "out") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium">
        <LogOut className="h-3.5 w-3.5" />
        Out {outTime ? outTime.slice(0, 5) : ""}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium">
      <Clock className="h-3.5 w-3.5" />
      No mark yet
    </span>
  )
}

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // today attendance quick state (no heavy fetch; UI reflects last action)
  const [todayMap, setTodayMap] = useState<Record<string, StaffAttendanceToday>>({})

  // Fetch staff
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(STAFF_API)
        const data = await res.json()
        setStaff(data)
      } catch (err) {
        console.error("Error fetching staff:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
  }, [])

  // ---- Attendance actions (REST) ----
  const handleStaffCheckIn = async (staffId: string) => {
    try {
      const res = await fetch(`${STAFF_ATT_API}/${staffId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: "{}", // some Nest pipes/validators expect a body
      })
      if (!res.ok) throw new Error(`Failed to check in (${res.status})`)
      const payload = await res.json()
      const { checkIn } = extractTimes(payload)

      // Reset checkOut on each new check-in
      setTodayMap((m) => ({
        ...m,
        [staffId]: {
          status: "in",
          checkIn: (checkIn as string) ?? new Date().toISOString().slice(11, 16),
          checkOut: undefined,
        },
      }))
    } catch (e) {
      console.error(e)
      alert("Check-in failed")
    }
  }

  const handleStaffCheckOut = async (staffId: string) => {
    try {
      const res = await fetch(`${STAFF_ATT_API}/${staffId}/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: "{}", // see note above
      })
      if (!res.ok) throw new Error(`Failed to check out (${res.status})`)
      const payload = await res.json()
      const { checkOut } = extractTimes(payload)

      setTodayMap((m) => ({
        ...m,
        [staffId]: {
          status: "out",
          checkIn: m[staffId]?.checkIn, // keep the last in-time
          checkOut: (checkOut as string) ?? new Date().toISOString().slice(11, 16),
        },
      }))
    } catch (e) {
      console.error(e)
      alert("Check-out failed")
    }
  }

  // CRUD
  const handleAddStaff = async (newStaff: Omit<StaffMember, "id">) => {
    try {
      const res = await fetch(STAFF_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      })
      const created = await res.json()
      setStaff((prev) => [...prev, created])
    } catch (err) {
      console.error("Error adding staff:", err)
    }
  }

  const handleUpdateStaff = async (updated: StaffMember) => {
    try {
      const res = await fetch(`${STAFF_API}/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      const saved = await res.json()
      setStaff((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
    } catch (err) {
      console.error("Error updating staff:", err)
    }
  }

  const handleDeleteStaff = async (id: string) => {
    try {
      await fetch(`${STAFF_API}/${id}`, { method: "DELETE" })
      setStaff((prev) => prev.filter((s) => s.id !== id))
      setTodayMap((m) => {
        const { [id]: _, ...rest } = m
        return rest
      })
    } catch (err) {
      console.error("Error deleting staff:", err)
    }
  }

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const activeStaff = staff.filter((s) => s.status === "active").length
  const onLeaveStaff = staff.filter((s) => s.status === "on_leave").length
  const totalPayroll = staff
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.hourlyRate * s.weeklyHours, 0)

  return (
    <AppShell title="Staff Management">
      <div className="space-y-6">
        {/* Stats Cards (kept your original icons/design) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{staff.length}</div>
              <div className="text-sm font-medium text-gray-600 mt-1">Total Staff Members</div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-2xl" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{activeStaff}</div>
              <div className="text-sm font-medium text-gray-600 mt-1">Active Staff</div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg">
                  <UserX className="h-6 w-6 text-white" />
                </div>
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{onLeaveStaff}</div>
              <div className="text-sm font-medium text-gray-600 mt-1">On Leave</div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">${totalPayroll.toFixed(0)}</div>
              <div className="text-sm font-medium text-gray-600 mt-1">Weekly Payroll</div>
            </div>
          </Card>
        </div>

        {/* Staff Directory */}
        <Section title="Staff Directory" description="Manage your team and track attendance.">
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search staff by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border-2 border-blue-200 focus:border-blue-400 bg-white shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 h-12 border-2 border-blue-200 focus:border-blue-400 bg-white shadow-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-12 border-2 border-blue-200 focus:border-blue-400 bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Optional legend */}
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" /> In
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-slate-400 ring-2 ring-white" /> Out
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-gray-300 ring-2 ring-white" /> No mark yet
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <AddStaffDialog onAdd={handleAddStaff} />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 border-0 h-14">
                    <TableHead className="text-white font-semibold text-base">Staff Member</TableHead>
                    <TableHead className="text-white font-semibold text-base">Role</TableHead>
                    <TableHead className="text-white font-semibold text-base">Status</TableHead>
                    <TableHead className="text-white font-semibold text-base">Contact</TableHead>
                    <TableHead className="text-white font-semibold text-base">Employment</TableHead>
                    <TableHead className="text-white font-semibold text-base text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member, index) => {
                    const att = todayMap[member.id]
                    return (
                      <TableRow
                        key={member.id}
                        className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-blue-25"
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg text-lg">
                                {member.firstName[0]}
                                {member.lastName[0]}
                              </div>
                              {/* Status dot */}
                              <span
                                className={[
                                  "absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-white",
                                  att?.status === "in"
                                    ? "bg-emerald-500"
                                    : att?.status === "out"
                                    ? "bg-slate-400"
                                    : "bg-gray-300",
                                ].join(" ")}
                                title={att?.status === "in" ? "Checked in" : att?.status === "out" ? "Checked out" : "No mark yet"}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {member.firstName} {member.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${ROLE_COLORS[member.role]} shadow-md capitalize px-3 py-1`}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`${STATUS_COLORS[member.status]} shadow-md capitalize px-3 py-1`}>
                              {member.status.replace("_", " ")}
                            </Badge>
                            <PresencePill s={att?.status} inTime={att?.checkIn} outTime={att?.checkOut} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-700">{member.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500 truncate max-w-[200px]">{member.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="font-semibold text-gray-900">${member.hourlyRate}/hr</div>
                            <div className="text-gray-500">{member.weeklyHours}h/week</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            {/* Attendance buttons with smart states */}
                            <Button
                              variant="ghost"
                              size="icon"
                              title={att?.status === "in" ? "Already in" : "Check in"}
                              onClick={() => handleStaffCheckIn(member.id)}
                              className={[
                                "hover:bg-emerald-100",
                                att?.status === "in" ? "text-emerald-400 cursor-not-allowed" : "text-emerald-600 hover:text-emerald-700",
                              ].join(" ")}
                              disabled={att?.status === "in"}
                            >
                              <LogIn className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              title={att?.status === "out" || !att?.status ? "Not in yet" : "Check out"}
                              onClick={() => handleStaffCheckOut(member.id)}
                              className={[
                                "hover:bg-slate-100",
                                att?.status === "out" || !att?.status ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:text-slate-700",
                              ].join(" ")}
                              disabled={att?.status === "out" || !att?.status}
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>

                            <StaffDetailsDialog staff={member} />
                            <EditStaffDialog staff={member} onUpdate={handleUpdateStaff} />
                            <DeleteStaffDialog staff={member} onDelete={handleDeleteStaff} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredStaff.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No staff members found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Get started by adding your first staff member."}
                </p>
                {!searchQuery && roleFilter === "all" && statusFilter === "all" && (
                  <AddStaffDialog onAdd={handleAddStaff} />
                )}
              </div>
            )}
          </div>
        </Section>
      </div>
    </AppShell>
  )
}

/* ---------------------- Dialogs (unchanged UI) ---------------------- */

function AddStaffDialog({ onAdd }: { onAdd: (staff: any) => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "staff",
    status: "active",
    hireDate: new Date().toISOString().split("T")[0],
    address: "",
    emergencyContact: { name: "", phone: "" },
    certifications: [],
    hourlyRate: 0,
    weeklyHours: 0,
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    setOpen(false)
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "staff",
      status: "active",
      hireDate: new Date().toISOString().split("T")[0],
      address: "",
      emergencyContact: { name: "", phone: "" },
      certifications: [],
      hourlyRate: 0,
      weeklyHours: 0,
      notes: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <Plus className="h-5 w-5 mr-2" />
          Add Staff Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            Add New Staff Member
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Enter the complete details for the new team member including contact, employment, and emergency information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">First Name *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Last Name *</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Employment Information
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Hourly Rate ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Weekly Hours</Label>
                  <Input
                    type="number"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                    className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Hire Date</Label>
                <Input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                <Phone className="h-5 w-5 text-pink-600" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Contact Name</Label>
                  <Input
                    value={formData.emergencyContact.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                      })
                    }
                    className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Contact Phone</Label>
                  <Input
                    value={formData.emergencyContact.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                      })
                    }
                    className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information about the staff member..."
                className="min-h-[100px] border-2 border-blue-200 focus:border-blue-400 bg-white resize-none"
              />
            </div>
          </DialogBody>

          <DialogFooter className="pt-6 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-2 border-gray-300 hover:bg-gray-50 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-xl px-8"
            >
              Add Staff Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditStaffDialog({ staff, onUpdate }: { staff: StaffMember; onUpdate: (s: StaffMember) => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<StaffMember>(staff)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-blue-100 text-blue-600 hover:text-blue-700">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Edit className="h-6 w-6 text-white" />
            </div>
            Edit Staff Member
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Update the details for {staff.firstName} {staff.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-6">
            {/* Personal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">First Name *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Last Name *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>
            </div>

            {/* Employment */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                  <SelectTrigger className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Weekly Hours</Label>
              <Input
                type="number"
                value={formData.weeklyHours}
                onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
              />
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Contact Name</Label>
                <Input
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                    })
                  }
                  className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Contact Phone</Label>
                <Input
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                    })
                  }
                  className="h-11 border-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information about the staff member..."
                className="min-h-[100px] border-2 border-blue-200 focus:border-blue-400 bg-white resize-none"
              />
            </div>
          </DialogBody>

          <DialogFooter className="pt-6 gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-2 border-gray-300 px-6">
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white border-0 shadow-xl px-8">
              Update Staff Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteStaffDialog({ staff, onDelete }: { staff: StaffMember; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const handleDelete = () => {
    onDelete(staff.id)
    setOpen(false)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-xl">
            <AlertTriangle className="h-6 w-6" />
            Delete Staff Member
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Are you sure you want to delete {staff.firstName} {staff.lastName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <h4 className="font-semibold text-red-800 mb-2">This will permanently:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Remove all staff records and employment history</li>
              <li>• Delete associated scheduling and time tracking data</li>
            </ul>
          </div>
        </DialogBody>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="border-2 border-gray-300 px-6">
            Cancel
          </Button>
          <Button onClick={handleDelete} className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 px-6">
            Delete Staff Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StaffDetailsDialog({ staff }: { staff: StaffMember }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-0 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg text-xl">
              {staff.firstName[0]}
              {staff.lastName[0]}
            </div>
            {staff.firstName} {staff.lastName}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Complete staff member information and employment details.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${ROLE_COLORS[staff.role]} shadow-md capitalize px-4 py-1.5`}>{staff.role}</Badge>
            <Badge className={`${STATUS_COLORS[staff.status]} shadow-md capitalize px-4 py-1.5`}>
              {staff.status.replace("_", " ")}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Calendar className="h-4 w-4" />
              Hired: {new Date(staff.hireDate).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-800 flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" />
              Contact Information
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{staff.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{staff.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{staff.address}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Employment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-gray-600">Weekly Hours</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{staff.weeklyHours}h</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">Hourly Rate</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">${staff.hourlyRate}</div>
              </div>
            </div>
          </div>

          {staff.emergencyContact?.name && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-800 flex items-center gap-2">
                <Phone className="h-5 w-5 text-pink-600" />
                Emergency Contact
              </h3>
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4">
                <div className="font-semibold text-gray-900">{staff.emergencyContact.name}</div>
                <div className="text-sm text-gray-600 mt-1">{staff.emergencyContact.phone}</div>
              </div>
            </div>
          )}

          {staff.certifications?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-800 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {staff.certifications.map((cert, i) => (
                  <Badge key={i} variant="secondary" className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {staff.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-800">Notes</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">{staff.notes}</div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
