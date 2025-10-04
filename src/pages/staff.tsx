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
  Search,
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
  Download,
  Upload,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  CheckCircle,
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
  emergencyContact: {
    name: string
    phone: string
  }
  certifications: string[]
  hourlyRate: number
  weeklyHours: number
  notes: string
  avatar?: string
}

const API_URL = "http://localhost:8080/staff"

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

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch staff from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(API_URL)
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

  // Add staff
  const handleAddStaff = async (newStaff: Omit<StaffMember, "id">) => {
    try {
      const res = await fetch(API_URL, {
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

  // Update staff
  const handleUpdateStaff = async (updated: StaffMember) => {
    try {
      const res = await fetch(`${API_URL}/${updated.id}`, {
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

  // Delete staff
  const handleDeleteStaff = async (id: string) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" })
      setStaff((prev) => prev.filter((s) => s.id !== id))
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
  const totalPayroll = staff
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.hourlyRate * s.weeklyHours, 0)

  return (
    <AppShell title="Staff Management">
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Floating decorative elements */}
          <div className="absolute top-6 right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-bounce" />
          <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse delay-1000" />

          <div className="relative p-8 md:p-12 text-white">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-20 w-20 items-center justify-center bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 animate-bounce">
                <Users className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
                  Staff Management
                </h1>
                <p className="mt-3 text-xl text-blue-50/90 font-medium">
                  Comprehensive team directory with certifications, scheduling, and payroll tracking
                </p>
                <div className="flex items-center gap-6 mt-4 text-blue-100/80">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    <span className="text-sm font-medium">Team Directory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span className="text-sm font-medium">Certifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">Payroll Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
              <div className="text-3xl font-bold text-gray-900">
                {staff.filter((s) => s.status === "on_leave").length}
              </div>
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

        {/* Staff Directory Section */}
        <Section title="Staff Directory" description="Manage your childcare center team members and track credentials.">
          <div className="space-y-6">
            {/* Search and Filters */}
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

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <AddStaffDialog onAdd={handleAddStaff} />
              </div>
            </div>

            {/* Staff Table */}
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
                  {filteredStaff.map((member, index) => (
                    <TableRow
                      key={member.id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-blue-25"
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg text-lg">
                            {member.firstName[0]}
                            {member.lastName[0]}
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
                        <Badge className={`${STATUS_COLORS[member.status]} shadow-md capitalize px-3 py-1`}>
                          {member.status.replace("_", " ")}
                        </Badge>
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
                          <StaffDetailsDialog staff={member} />
                          <EditStaffDialog staff={member} onUpdate={handleUpdateStaff} />
                          <DeleteStaffDialog staff={member} onDelete={handleDeleteStaff} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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

/* ---------------------- Dialogs ---------------------- */

// Add Staff Dialog
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

// Edit Staff Dialog
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
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
        >
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
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                  >
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
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white border-0 shadow-xl px-8"
            >
              Update Staff Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Delete Staff Dialog
function DeleteStaffDialog({ staff, onDelete }: { staff: StaffMember; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    onDelete(staff.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors"
        >
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
              <li>• Remove access to the childcare management system</li>
              <li>• Archive any messages or communications</li>
            </ul>
          </div>
        </DialogBody>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="border-2 border-gray-300 px-6">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-lg px-6"
          >
            Delete Staff Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Staff Details Dialog
function StaffDetailsDialog({ staff }: { staff: StaffMember }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition-colors"
        >
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
          {/* Status and Role */}
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

          {/* Contact Information */}
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

          {/* Employment Details */}
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

          {/* Emergency Contact */}
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

          {/* Certifications */}
          {staff.certifications && staff.certifications.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-800 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {staff.certifications.map((cert, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 shadow-sm px-3 py-1"
                  >
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {staff.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-800">Notes</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">{staff.notes}</div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={() => setOpen(false)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
