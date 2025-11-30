"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
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
import { cn } from "../lib/utils"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  Shield,
  Users,
  Filter,
  Eye,
  Baby,
  GraduationCap,
  Settings,
  Loader2,
  RefreshCw,
  CheckCircle2,
  UserCircle,
  Save,
} from "lucide-react"

type UserRole = "admin" | "staff" | "parent"

// Shape used in the UI
interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: UserRole
  url_img: string
  phone: string
}

// Shape used when sending data to backend (no id)
interface UserPayload {
  first_name: string
  last_name: string
  email: string
  password?: string
  role: UserRole
  url_img: string
  phone: string
}

const API_URL = "http://localhost:8080/users"

const ROLE_COLORS: Record<UserRole, string> = {
  admin:
    "bg-gradient-to-r from-purple-500/10 to-violet-500/10 text-purple-700 border-purple-200/50 dark:from-purple-500/20 dark:to-violet-500/20 dark:text-purple-300 dark:border-purple-700/50",
  staff:
    "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200/50 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-300 dark:border-blue-700/50",
  parent:
    "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 border-emerald-200/50 dark:from-emerald-500/20 dark:to-green-500/20 dark:text-emerald-300 dark:border-emerald-700/50",
}

const ROLE_ICONS: Record<UserRole, React.ComponentType<any>> = {
  admin: Settings,
  staff: GraduationCap,
  parent: Baby,
}

/* ───────────────────────────── Add User ───────────────────────────── */

function AddUserDialog({ onUserAdded }: { onUserAdded: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<UserPayload>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "parent",
    url_img: "",
    phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setOpen(false)
        onUserAdded()
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          role: "parent",
          url_img: "",
          phone: "",
        })
      } else {
        console.error("Failed to create user", await response.text())
      }
    } catch (error) {
      console.error("Error adding user:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white border-0">
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Add New User
          </DialogTitle>
          <DialogDescription>Create a new user account for your childcare center.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    placeholder="First Name"
                    className="transition-all focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    placeholder="Last Name"
                    className="transition-all focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="username@salamnest.com"
                  className="transition-all focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+21612345678"
                  className="transition-all focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="strongPassword123"
                  className="transition-all focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url_img">Profile Image URL</Label>
                <Input
                  id="url_img"
                  value={formData.url_img}
                  onChange={(e) => setFormData({ ...formData, url_img: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="transition-all focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                Role
              </h3>
              <div className="space-y-2">
                <Label htmlFor="role">User Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="staff">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Staff Member
                      </div>
                    </SelectItem>
                    <SelectItem value="parent">
                      <div className="flex items-center gap-2">
                        <Baby className="h-4 w-4" />
                        Parent/Guardian
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="shadow-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ───────────────────────────── Edit User ───────────────────────────── */

function EditUserDialog({ user, onUserUpdated }: { user: User; onUserUpdated: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<UserPayload>({
    ...user,
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Front guard: avoid /users/NaN
    if (user.id === undefined || user.id === null || Number.isNaN(Number(user.id))) {
      console.error("[EditUserDialog] Invalid user.id:", user.id)
      alert("Internal error: invalid user id")
      setLoading(false)
      return
    }

    // Don't send empty password if not changing it
    const { password, ...rest } = formData
    const payloadToSend = password ? formData : rest

    try {
      const response = await fetch(`${API_URL}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend),
      })
      if (response.ok) {
        setOpen(false)
        onUserUpdated()
      } else {
        console.error("Failed to update user", await response.text())
      }
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 transition-all"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update information for {user.first_name} {user.last_name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="transition-all focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="transition-all focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_email">Email *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="transition-all focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone *</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="transition-all focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_url_img">Profile Image URL</Label>
                <Input
                  id="edit_url_img"
                  value={formData.url_img}
                  onChange={(e) => setFormData({ ...formData, url_img: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_password">New Password (optional)</Label>
                <Input
                  id="edit_password"
                  type="password"
                  value={formData.password ?? ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                  className="transition-all focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                Role
              </h3>
              <div className="space-y-2">
                <Label htmlFor="edit_role">User Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="staff">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Staff Member
                      </div>
                    </SelectItem>
                    <SelectItem value="parent">
                      <div className="flex items-center gap-2">
                        <Baby className="h-4 w-4" />
                        Parent/Guardian
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="shadow-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ───────────────────────────── User Details ───────────────────────────── */

function UserDetailsDialog({ user }: { user: User }) {
  const [open, setOpen] = React.useState(false)
  const RoleIcon = ROLE_ICONS[user.role]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-fuchsia-500/10 transition-all"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-25" />
              <img
                src={
                  user.url_img || `/placeholder.svg?height=48&width=48&text=${user.first_name[0]}${user.last_name[0]}`
                }
                alt={`${user.first_name} ${user.last_name}`}
                className="relative h-12 w-12 rounded-full border-2 border-white dark:border-gray-800 shadow-lg object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <div className="text-sm text-muted-foreground font-normal">{user.email}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {/* Role */}
          <div className="flex items-center gap-3">
            <Badge className={cn(ROLE_COLORS[user.role], "gap-1.5 px-3 py-1.5 border shadow-sm")}>
              <RoleIcon className="h-3.5 w-3.5" />
              {user.role}
            </Badge>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />
              Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border border-violet-200/50 dark:border-violet-700/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border border-violet-200/50 dark:border-violet-700/50">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phone}</span>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          {user.url_img && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                Profile Image
              </h3>
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-25" />
                <img
                  src={user.url_img || "/placeholder.svg"}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="relative w-full h-full rounded-full border-4 border-white dark:border-gray-800 shadow-xl object-cover"
                />
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={() => setOpen(false)}
            className="shadow-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white border-0"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ───────────────────────────── Delete User ───────────────────────────── */

function DeleteUserDialog({ user, onUserDeleted }: { user: User; onUserDeleted: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleDelete = async () => {
    // Guard against bad id
    if (user.id === undefined || user.id === null || Number.isNaN(Number(user.id))) {
      console.error("[DeleteUserDialog] Invalid user.id:", user.id)
      alert("Internal error: invalid user id")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/${user.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setOpen(false)
        onUserDeleted()
      } else {
        console.error("Failed to delete user", await response.text())
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-rose-500/10 transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {user.first_name} {user.last_name}'s account? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <img
                src={
                  user.url_img || `/placeholder.svg?height=48&width=48&text=${user.first_name[0]}${user.last_name[0]}`
                }
                alt={`${user.first_name} ${user.last_name}`}
                className="h-12 w-12 rounded-full border-2 border-red-200 dark:border-red-800 object-cover"
              />
              <div>
                <div className="font-semibold text-red-900 dark:text-red-100">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">{user.email}</div>
                <Badge className={cn(ROLE_COLORS[user.role], "mt-1")}>{user.role}</Badge>
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ───────────────────────────── Main Page ───────────────────────────── */

export default function UserManagement() {
  const { can } = useRBAC()
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")

  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(API_URL)
      if (response.ok) {
        const data = await response.json()
        // 🔥 Map backend shape (user_id, ...) → frontend shape (id, ...)
        const mapped: User[] = (data as any[]).map((u) => ({
          id: u.id ?? u.user_id, // supports both shapes if ever changed
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          role: u.role as UserRole,
          url_img: u.url_img ?? "",
          phone: u.phone ?? "",
        }))
        setUsers(mapped)
      } else {
        console.error("Failed to fetch users", await response.text())
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  if (!can("manage:settings")) {
    return (
      <AppShell title="User Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-25" />
              <Shield className="relative h-16 w-16 text-muted-foreground mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Access Restricted
            </h3>
            <p className="text-muted-foreground">You don't have permission to manage users.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalUsers = users.length
  const adminCount = users.filter((u) => u.role === "admin").length
  const staffCount = users.filter((u) => u.role === "staff").length
  const parentCount = users.filter((u) => u.role === "parent").length

  return (
    <AppShell title="User Management">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Users</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {totalUsers}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    All accounts
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 shadow-lg">
                  <Users className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-full blur-3xl" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Administrators</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    {adminCount}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Admin role
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
                  <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Staff Members</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {staffCount}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Staff role
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                  <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-3xl" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Parents</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {parentCount}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <Baby className="h-3 w-3" />
                    Parent role
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg">
                  <Baby className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* User Management */}
        <Section title="User Directory" description="Manage all user accounts in your childcare center.">
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Staff
                    </div>
                  </SelectItem>
                  <SelectItem value="parent">
                    <div className="flex items-center gap-2">
                      <Baby className="h-4 w-4" />
                      Parent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <AddUserDialog onUserAdded={fetchUsers} />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchUsers}
                  disabled={loading}
                  className="shadow-sm bg-transparent hover:bg-accent"
                  title="Refresh"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur animate-pulse" />
                    <Loader2 className="relative h-12 w-12 text-violet-600 dark:text-violet-400 animate-spin" />
                  </div>
                  <div className="text-sm text-muted-foreground">Loading users...</div>
                </div>
              </div>
            ) : (
              <>
                <div className="relative overflow-hidden border-2 rounded-2xl shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 hover:from-violet-500/10 hover:via-purple-500/10 hover:to-fuchsia-500/10">
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => {
                        const RoleIcon = ROLE_ICONS[user.role]
                        return (
                          <TableRow
                            key={user.id}
                            className="hover:bg-gradient-to-r hover:from-violet-500/5 hover:via-purple-500/5 hover:to-fuchsia-500/5 transition-all"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative group">
                                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-0 group-hover:opacity-25 transition-opacity" />
                                  <img
                                    src={
                                      user.url_img ||
                                      `/placeholder.svg?height=40&width=40&text=${user.first_name[0] || "/placeholder.svg"}${user.last_name[0]}`
                                    }
                                    alt={`${user.first_name} ${user.last_name}`}
                                    className="relative h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(ROLE_COLORS[user.role], "gap-1.5 font-medium border shadow-sm")}>
                                <RoleIcon className="h-3.5 w-3.5" />
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5" />
                                  {user.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <UserDetailsDialog user={user} />
                                <EditUserDialog user={user} onUserUpdated={fetchUsers} />
                                <DeleteUserDialog user={user} onUserDeleted={fetchUsers} />
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {filteredUsers.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="relative inline-block mb-4">
                      <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-25" />
                      <UserCircle className="relative h-16 w-16 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      No users found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || roleFilter !== "all"
                        ? "Try adjusting your search or filters."
                        : "Get started by adding your first user."}
                    </p>
                    {!searchQuery && roleFilter === "all" && <AddUserDialog onUserAdded={fetchUsers} />}
                  </div>
                )}
              </>
            )}
          </div>
        </Section>
      </div>
    </AppShell>
  )
}
