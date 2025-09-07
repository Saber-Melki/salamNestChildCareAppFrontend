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
import { useI18n } from "../contexts/i18n"
import { cn } from "../lib/utils"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Filter,
  Download,
  Upload,
  Eye,
  Building,
  Baby,
  GraduationCap,
  Settings,
  Key,
  Lock,
  Unlock,
} from "lucide-react"

interface UserManagementUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: "admin" | "staff" | "parent"
  status: "active" | "inactive" | "pending" | "suspended"
  createdDate: string
  lastLogin?: string
  address: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  children?: string[] // For parents - child IDs
  department?: string // For staff
  permissions?: string[]
  notes: string
  avatar?: string
  isVerified: boolean
  loginAttempts: number
}

const INITIAL_USERS: UserManagementUser[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@childcare.com",
    phone: "(555) 123-4567",
    role: "admin",
    status: "active",
    createdDate: "2020-01-15",
    lastLogin: "2024-01-15T10:30:00Z",
    address: "123 Main St, City, State 12345",
    department: "Administration",
    permissions: ["all"],
    notes: "System administrator with full access",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    isVerified: true,
    loginAttempts: 0,
  },
  {
    id: "2",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@childcare.com",
    phone: "(555) 234-5678",
    role: "staff",
    status: "active",
    createdDate: "2021-08-20",
    lastLogin: "2024-01-14T15:45:00Z",
    address: "456 Oak Ave, City, State 12345",
    department: "Toddler Room",
    permissions: ["manage:children", "manage:attendance", "view:reports"],
    notes: "Lead teacher for toddler group",
    avatar: "/placeholder.svg?height=40&width=40&text=ED",
    isVerified: true,
    loginAttempts: 0,
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@parent.com",
    phone: "(555) 345-6789",
    role: "parent",
    status: "active",
    createdDate: "2022-03-10",
    lastLogin: "2024-01-13T08:20:00Z",
    address: "789 Pine St, City, State 12345",
    emergencyContact: {
      name: "Lisa Brown",
      phone: "(555) 765-4321",
      relationship: "Spouse",
    },
    children: ["child-1", "child-2"],
    notes: "Parent of Emma and Jake Brown",
    avatar: "/placeholder.svg?height=40&width=40&text=MB",
    isVerified: true,
    loginAttempts: 0,
  },
  {
    id: "4",
    firstName: "Jessica",
    lastName: "Wilson",
    email: "jessica.wilson@parent.com",
    phone: "(555) 456-7890",
    role: "parent",
    status: "pending",
    createdDate: "2024-01-10",
    address: "321 Elm St, City, State 12345",
    children: ["child-3"],
    notes: "New parent - account pending verification",
    avatar: "/placeholder.svg?height=40&width=40&text=JW",
    isVerified: false,
    loginAttempts: 0,
  },
  {
    id: "5",
    firstName: "David",
    lastName: "Miller",
    email: "david.miller@childcare.com",
    phone: "(555) 567-8901",
    role: "staff",
    status: "suspended",
    createdDate: "2023-06-15",
    lastLogin: "2024-01-05T12:00:00Z",
    address: "654 Maple Ave, City, State 12345",
    department: "Kitchen",
    permissions: ["view:children"],
    notes: "Suspended pending investigation",
    avatar: "/placeholder.svg?height=40&width=40&text=DM",
    isVerified: true,
    loginAttempts: 3,
  },
]

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-800",
  staff: "bg-blue-100 text-blue-800",
  parent: "bg-green-100 text-green-800",
}

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
}

const ROLE_ICONS = {
  admin: Settings,
  staff: GraduationCap,
  parent: Baby,
}

function AddUserDialog() {
  const [open, setOpen] = React.useState(false)
  const { t, isRTL } = useI18n()
  const [formData, setFormData] = React.useState<{
    firstName: string
    lastName: string
    email: string
    phone: string
    role: "admin" | "staff" | "parent" | ""
    address: string
    department: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactRelationship: string
    notes: string
    sendWelcomeEmail: boolean
  }>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    address: "",
    department: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    notes: "",
    sendWelcomeEmail: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Adding user:", formData)
    setOpen(false)
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      address: "",
      department: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      notes: "",
      sendWelcomeEmail: true,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("gap-2", isRTL && "flex-row-reverse")}>
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user account for admin, staff, or parent.</DialogDescription>
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

            {/* Role & Access */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Role & Access</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as "admin" | "staff" | "parent" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <Settings className="h-4 w-4" />
                          Administrator
                        </div>
                      </SelectItem>
                      <SelectItem value="staff">
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <GraduationCap className="h-4 w-4" />
                          Staff Member
                        </div>
                      </SelectItem>
                      <SelectItem value="parent">
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <Baby className="h-4 w-4" />
                          Parent/Guardian
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === "staff" && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administration">Administration</SelectItem>
                        <SelectItem value="infant-room">Infant Room</SelectItem>
                        <SelectItem value="toddler-room">Toddler Room</SelectItem>
                        <SelectItem value="preschool">Preschool</SelectItem>
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact (for parents) */}
            {formData.role === "parent" && (
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
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the user..."
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Options</h3>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <input
                  type="checkbox"
                  id="sendWelcomeEmail"
                  checked={formData.sendWelcomeEmail}
                  onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="sendWelcomeEmail">Send welcome email with login instructions</Label>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditUserDialog({ user }: { user: UserManagementUser }) {
  const [open, setOpen] = React.useState(false)
  const { isRTL } = useI18n()
  const [formData, setFormData] = React.useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    address: user.address,
    department: user.department || "",
    emergencyContactName: user.emergencyContact?.name || "",
    emergencyContactPhone: user.emergencyContact?.phone || "",
    emergencyContactRelationship: user.emergencyContact?.relationship || "",
    notes: user.notes,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Updating user:", formData)
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
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the details for {user.firstName} {user.lastName}.
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

            {/* Role & Status */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Role & Status</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as "admin" | "staff" | "parent" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="staff">Staff Member</SelectItem>
                      <SelectItem value="parent">Parent/Guardian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" | "pending" | "suspended" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === "staff" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administration">Administration</SelectItem>
                        <SelectItem value="infant-room">Infant Room</SelectItem>
                        <SelectItem value="toddler-room">Toddler Room</SelectItem>
                        <SelectItem value="preschool">Preschool</SelectItem>
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact (for parents) */}
            {formData.role === "parent" && (
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
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the user..."
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserDetailsDialog({ user }: { user: UserManagementUser }) {
  const [open, setOpen] = React.useState(false)
  const { isRTL } = useI18n()
  const RoleIcon = ROLE_ICONS[user.role]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <img
              src={user.avatar || "/placeholder.svg?height=40&width=40&text=" + user.firstName[0] + user.lastName[0]}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-10 w-10 rounded-full"
            />
            {user.firstName} {user.lastName}
            {!user.isVerified && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
          </DialogTitle>
          <DialogDescription>Complete user information and account details.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {/* Status and Role */}
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <Badge className={ROLE_COLORS[user.role]}>
              <RoleIcon className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
              {user.role}
            </Badge>
            <Badge className={STATUS_COLORS[user.status]}>{user.status}</Badge>
            <div className="text-sm text-gray-500">Created: {new Date(user.createdDate).toLocaleDateString()}</div>
            {user.lastLogin && (
              <div className="text-sm text-gray-500">Last login: {new Date(user.lastLogin).toLocaleDateString()}</div>
            )}
          </div>

          {/* Account Security */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Account Security</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                {user.isVerified ? (
                  <Shield className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm">{user.isVerified ? "Verified" : "Unverified"}</span>
              </div>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                {user.loginAttempts > 0 ? (
                  <Lock className="h-4 w-4 text-red-500" />
                ) : (
                  <Unlock className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm">{user.loginAttempts} failed attempts</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.phone}</span>
              </div>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{user.address}</span>
            </div>
          </div>

          {/* Role-specific Information */}
          {user.role === "staff" && user.department && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Employment Details</h3>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.department}</span>
              </div>
            </div>
          )}

          {user.role === "parent" && user.children && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Children</h3>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Baby className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.children.length} child(ren) enrolled</span>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {user.emergencyContact && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Emergency Contact</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium">{user.emergencyContact.name}</div>
                <div className="text-sm text-gray-600">{user.emergencyContact.relationship}</div>
                <div className="text-sm text-gray-600">{user.emergencyContact.phone}</div>
              </div>
            </div>
          )}

          {/* Permissions */}
          {user.permissions && user.permissions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {user.notes && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">{user.notes}</div>
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

function DeleteUserDialog({ user }: { user: UserManagementUser }) {
  const [open, setOpen] = React.useState(false)

  const handleDelete = () => {
    console.log("Deleting user:", user.id)
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
            Delete User Account
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {user.firstName} {user.lastName}'s account? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">This will permanently:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Remove all user data and account information</li>
              <li>• Delete associated messages and communications</li>
              <li>• Remove access to the childcare management system</li>
              {user.role === "parent" && <li>• Archive child enrollment records</li>}
              {user.role === "staff" && <li>• Remove staff scheduling and attendance data</li>}
            </ul>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete User Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({ user }: { user: UserManagementUser }) {
  const [open, setOpen] = React.useState(false)
  const [sendEmail, setSendEmail] = React.useState(true)

  const handleReset = () => {
    console.log("Resetting password for user:", user.id, "Send email:", sendEmail)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Reset Password">
          <Key className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset the password for {user.firstName} {user.lastName}.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will generate a new temporary password and optionally send login instructions to the user's email
              address.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendResetEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="sendResetEmail">Send password reset email to {user.email}</Label>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleReset}>Reset Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function UserManagement() {
  const { can } = useRBAC()
  const { isRTL } = useI18n()
  const [users, setUsers] = React.useState<UserManagementUser[]>(INITIAL_USERS)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  if (!can("manage:settings")) {
    return (
      <AppShell title="User Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-500">You don't have permission to manage users.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === "active").length
  const pendingUsers = users.filter((u) => u.status === "pending").length
  const suspendedUsers = users.filter((u) => u.status === "suspended").length

  return (
    <AppShell title="User Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingUsers}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{suspendedUsers}</div>
                <div className="text-sm text-gray-500">Suspended</div>
              </div>
            </div>
          </Card>
        </div>

        {/* User Management */}
        <Section title="User Directory" description="Manage all user accounts in your childcare center.">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className={cn(
                    "absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400",
                    isRTL ? "right-3" : "left-3",
                  )}
                />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(isRTL ? "pr-10" : "pl-10")}
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
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
              <div className="flex gap-2">
                <AddUserDialog />
                <Button variant="outline" className={cn("gap-2 bg-transparent", isRTL && "flex-row-reverse")}>
                  <Upload className="h-4 w-4" />
                  Import Users
                </Button>
              </div>
              <Button variant="outline" className={cn("gap-2 bg-transparent", isRTL && "flex-row-reverse")}>
                <Download className="h-4 w-4" />
                Export Users
              </Button>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const RoleIcon = ROLE_ICONS[user.role]
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                            <div className="relative">
                              <img
                                src={
                                  user.avatar ||
                                  "/placeholder.svg?height=32&width=32&text=" + user.firstName[0] + user.lastName[0] ||
                                  "/placeholder.svg"
                                }
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-8 w-8 rounded-full"
                              />
                              {!user.isVerified && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={ROLE_COLORS[user.role]}>
                            <RoleIcon className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[user.status]}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                              <Phone className="h-3 w-3 text-gray-400" />
                              {user.phone}
                            </div>
                            <div className={cn("flex items-center gap-1 text-gray-500", isRTL && "flex-row-reverse")}>
                              <Mail className="h-3 w-3 text-gray-400" />
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.lastLogin ? (
                              <>
                                <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
                                <div className="text-gray-500">{new Date(user.lastLogin).toLocaleTimeString()}</div>
                              </>
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <UserDetailsDialog user={user} />
                            <EditUserDialog user={user} />
                            <ResetPasswordDialog user={user} />
                            <DeleteUserDialog user={user} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Get started by adding your first user."}
                </p>
                {!searchQuery && roleFilter === "all" && statusFilter === "all" && <AddUserDialog />}
              </div>
            )}
          </div>
        </Section>
      </div>
    </AppShell>
  )
}
