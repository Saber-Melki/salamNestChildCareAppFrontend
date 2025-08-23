"use client"

import React from "react"
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogTrigger,
} from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useRBAC } from "../contexts/rbac"
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
  Shield,
  Award,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Filter,
  Download,
  Upload,
} from "lucide-react"

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: "director" | "teacher" | "assistant" | "substitute" | "admin"
  status: "active" | "inactive" | "on-leave"
  hireDate: string
  address: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  certifications: string[]
  hourlyRate: number
  weeklyHours: number
  notes: string
  avatar?: string
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@childcare.com",
    phone: "(555) 123-4567",
    role: "director",
    status: "active",
    hireDate: "2020-01-15",
    address: "123 Main St, City, State 12345",
    emergencyContact: {
      name: "Mike Johnson",
      phone: "(555) 987-6543",
      relationship: "Spouse",
    },
    certifications: ["CPR", "First Aid", "Early Childhood Education"],
    hourlyRate: 28.5,
    weeklyHours: 40,
    notes: "Excellent leadership skills, great with parents",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
  },
  {
    id: "2",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@childcare.com",
    phone: "(555) 234-5678",
    role: "teacher",
    status: "active",
    hireDate: "2021-08-20",
    address: "456 Oak Ave, City, State 12345",
    emergencyContact: {
      name: "Robert Davis",
      phone: "(555) 876-5432",
      relationship: "Father",
    },
    certifications: ["CPR", "First Aid", "Montessori Training"],
    hourlyRate: 22.0,
    weeklyHours: 35,
    notes: "Specializes in toddler care, very patient",
    avatar: "/placeholder.svg?height=40&width=40&text=ED",
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@childcare.com",
    phone: "(555) 345-6789",
    role: "assistant",
    status: "on-leave",
    hireDate: "2022-03-10",
    address: "789 Pine St, City, State 12345",
    emergencyContact: {
      name: "Lisa Brown",
      phone: "(555) 765-4321",
      relationship: "Wife",
    },
    certifications: ["CPR", "First Aid"],
    hourlyRate: 18.0,
    weeklyHours: 30,
    notes: "On paternity leave until next month",
    avatar: "/placeholder.svg?height=40&width=40&text=MB",
  },
  {
    id: "4",
    firstName: "Jessica",
    lastName: "Wilson",
    email: "jessica.wilson@childcare.com",
    phone: "(555) 456-7890",
    role: "substitute",
    status: "active",
    hireDate: "2023-01-05",
    address: "321 Elm St, City, State 12345",
    emergencyContact: {
      name: "Tom Wilson",
      phone: "(555) 654-3210",
      relationship: "Brother",
    },
    certifications: ["CPR", "First Aid"],
    hourlyRate: 16.5,
    weeklyHours: 20,
    notes: "Available for weekend and evening shifts",
    avatar: "/placeholder.svg?height=40&width=40&text=JW",
  },
]

const ROLE_COLORS = {
  director: "bg-purple-100 text-purple-800",
  teacher: "bg-blue-100 text-blue-800",
  assistant: "bg-green-100 text-green-800",
  substitute: "bg-yellow-100 text-yellow-800",
  admin: "bg-red-100 text-red-800",
}

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  "on-leave": "bg-orange-100 text-orange-800",
}

function AddStaffDialog() {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    hourlyRate: "",
    weeklyHours: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Adding staff member:", formData)
    setOpen(false)
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      hourlyRate: "",
      weeklyHours: "",
      notes: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>Enter the details for the new staff member.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Employment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="substitute">Substitute</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyHours">Weekly Hours</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({ ...formData, weeklyHours: e.target.value })}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                <Input
                  id="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the staff member..."
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Staff Member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditStaffDialog({ staff }: { staff: StaffMember }) {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    phone: staff.phone,
    role: staff.role,
    status: staff.status,
    address: staff.address,
    emergencyContactName: staff.emergencyContact.name,
    emergencyContactPhone: staff.emergencyContact.phone,
    emergencyContactRelationship: staff.emergencyContact.relationship,
    hourlyRate: staff.hourlyRate.toString(),
    weeklyHours: staff.weeklyHours.toString(),
    notes: staff.notes,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Updating staff member:", formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update the details for {staff.firstName} {staff.lastName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Employment Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="substitute">Substitute</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="edit-hourlyRate"
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-weeklyHours">Weekly Hours</Label>
                <Input
                  id="edit-weeklyHours"
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({ ...formData, weeklyHours: e.target.value })}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-emergencyContactName">Contact Name</Label>
                  <Input
                    id="edit-emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="edit-emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-emergencyContactRelationship">Relationship</Label>
                <Input
                  id="edit-emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the staff member..."
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Staff Member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteStaffDialog({ staff }: { staff: StaffMember }) {
  const [open, setOpen] = React.useState(false)

  const handleDelete = () => {
    console.log("Deleting staff member:", staff.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Staff Member
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {staff.firstName} {staff.lastName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">This will permanently:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Remove all staff records and employment history</li>
              <li>• Delete associated scheduling and time tracking data</li>
              <li>• Remove access to the childcare management system</li>
              <li>• Archive any messages or communications</li>
            </ul>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete Staff Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StaffDetailsDialog({ staff }: { staff: StaffMember }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
                  src="/teacher.png"
                  alt="Teacher avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
            {staff.firstName} {staff.lastName}
          </DialogTitle>
          <DialogDescription>Complete staff member information and employment details.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {/* Status and Role */}
          <div className="flex items-center gap-4">
            <Badge className={ROLE_COLORS[staff.role]}>{staff.role}</Badge>
            <Badge className={STATUS_COLORS[staff.status]}>{staff.status}</Badge>
            <div className="text-sm text-gray-500">Hired: {new Date(staff.hireDate).toLocaleDateString()}</div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{staff.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{staff.address}</span>
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Employment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{staff.weeklyHours} hours/week</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-400" />
                <span className="text-sm">${staff.hourlyRate}/hour</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Emergency Contact</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium">{staff.emergencyContact.name}</div>
              <div className="text-sm text-gray-600">{staff.emergencyContact.relationship}</div>
              <div className="text-sm text-gray-600">{staff.emergencyContact.phone}</div>
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {staff.certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          {staff.notes && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">{staff.notes}</div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Staff() {
  const { can } = useRBAC()
  const [staff, setStaff] = React.useState<StaffMember[]>(INITIAL_STAFF)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  if (!can("manage:settings")) {
    return (
      <AppShell title="Staff Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-500">You don't have permission to manage staff members.</p>
          </div>
        </div>
      </AppShell>
    )
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{staff.length}</div>
                <div className="text-sm text-gray-500">Total Staff</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeStaff}</div>
                <div className="text-sm text-gray-500">Active Staff</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserX className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{staff.filter((s) => s.status === "on-leave").length}</div>
                <div className="text-sm text-gray-500">On Leave</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">${totalPayroll.toFixed(0)}</div>
                <div className="text-sm text-gray-500">Weekly Payroll</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Staff Management */}
        <Section title="Staff Directory" description="Manage your childcare center staff members.">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search staff by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="substitute">Substitute</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <AddStaffDialog />
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </Button>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Staff List
              </Button>
            </div>

            {/* Staff Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Employment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              // member.avatar ||
                              "/teacher.png?height=32&width=32&text=" + member.firstName[0] + member.lastName[0] ||
                              "/placeholder.svg"
                            }
                            alt={`${member.firstName} ${member.lastName}`}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[member.role]}>{member.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[member.status]}>{member.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {member.phone}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {member.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>${member.hourlyRate}/hr</div>
                          <div className="text-gray-500">{member.weeklyHours}h/week</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <StaffDetailsDialog staff={member} />
                          <EditStaffDialog staff={member} />
                          <DeleteStaffDialog staff={member} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredStaff.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Get started by adding your first staff member."}
                </p>
                {!searchQuery && roleFilter === "all" && statusFilter === "all" && <AddStaffDialog />}
              </div>
            )}
          </div>
        </Section>
      </div>
    </AppShell>
  )
}