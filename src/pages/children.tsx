"use client"

import React, { useEffect } from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { Plus, User, Phone, AlertTriangle, Edit, Trash2, Sparkles, User2, Users, Heart, Star, Search, Baby } from "lucide-react"
import { cn } from "../lib/utils"

type ChildRow = {
  id: string
  firstName: string
  lastName: string
  family: string
  authorizedPickups: number
  allergies?: string
  age: number
  group: string
  emergencyContact: string
  emergencyPhone: string
  parentEmail: string
  notes: string
}

export default function Children() {
  const [q, setQ] = React.useState("")
  const [rows, setRows] = React.useState<ChildRow[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingChild, setEditingChild] = React.useState<ChildRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [childToDelete, setChildToDelete] = React.useState<ChildRow | null>(null)
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    family: "",
    age: "",
    group: "",
    allergies: "",
    emergencyContact: "",
    emergencyPhone: "",
    parentEmail: "",
    notes: "",
  })

  const API_URL = "http://localhost:8080/children"

  // Fetch all children on mount
  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setRows(data)
    } catch (err) {
      console.error("Failed to fetch children:", err)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      family: "",
      age: "",
      group: "",
      allergies: "",
      emergencyContact: "",
      emergencyPhone: "",
      parentEmail: "",
      notes: "",
    })
  }

  const openEditDialog = (child: ChildRow) => {
    setEditingChild(child)
    setFormData({
      firstName: child.firstName,
      lastName: child.lastName,
      family: child.family,
      age: child.age.toString(),
      group: child.group,
      allergies: child.allergies || "",
      emergencyContact: child.emergencyContact,
      emergencyPhone: child.emergencyPhone,
      parentEmail: child.parentEmail,
      notes: child.notes,
    })
    setDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingChild(null)
    resetForm()
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingChild) {
        // Update child
        const res = await fetch(`${API_URL}/${editingChild.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            age: Number(formData.age),
          }),
        })
        const updatedChild = await res.json()
        setRows((prev) => prev.map((row) => (row.id === editingChild.id ? updatedChild : row)))
      } else {
        // Create new child
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            age: Number(formData.age),
          }),
        })
        const newChild = await res.json()
        setRows((prev) => [...prev, newChild])
      }
    } catch (err) {
      console.error("Failed to submit child:", err)
    }

    resetForm()
    setEditingChild(null)
    setDialogOpen(false)
  }

  const handleDelete = (child: ChildRow) => {
    setChildToDelete(child)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (childToDelete) {
      try {
        await fetch(`${API_URL}/${childToDelete.id}`, { method: "DELETE" })
        setRows((prev) => prev.filter((row) => row.id !== childToDelete.id))
      } catch (err) {
        console.error("Failed to delete child:", err)
      }
      setChildToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const filtered = rows.filter((r) =>
    `${r.firstName} ${r.lastName}`.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <AppShell title="Child Profiles">
      <div className="space-y-8">
        {/* Enhanced Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative p-8 md:p-12 text-white">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                <Baby className="h-8 w-8 animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                  Child Profiles
                </h1>
                <p className="mt-3 text-xl text-white/90 max-w-2xxl">
                  Comprehensive family details, medical information, and emergency contacts
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-300" />
                    <span className="text-white/80">Safe & secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-300" />
                    <span className="text-white/80">Easy management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating decorative elements */}
          <div className="absolute top-6 right-6 animate-bounce">
            <Sparkles className="h-6 w-6 text-yellow-300" />
          </div>
          <div className="absolute bottom-6 right-12 animate-pulse">
            <Heart className="h-5 w-5 text-pink-300" />
          </div>
        </div>

        {/* Enhanced Search & Add Section */}
        <Section title="Child Management" description="Manage profiles, medical information, and family contacts">
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search children by name..."
                className="pl-10 border-2 border-purple-100 focus:border-purple-400 rounded-xl bg-white/80"
              />
            </div>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </div>

          {/* Enhanced Children Table */}
          <div className="mt-6 rounded-2xl border-0 bg-white shadow-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
                  <TableHead className="font-bold text-purple-800 py-4">Child</TableHead>
                  <TableHead className="font-bold text-purple-800">Age</TableHead>
                  <TableHead className="font-bold text-purple-800">Group</TableHead>
                  <TableHead className="font-bold text-purple-800">Family</TableHead>
                  <TableHead className="font-bold text-purple-800">Contact</TableHead>
                  <TableHead className="font-bold text-purple-800">Allergies</TableHead>
                  <TableHead className="font-bold text-purple-800 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r, index) => (
                  <TableRow
                    key={r.id}
                    className={cn(
                      "hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200 border-b border-purple-50",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                    )}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        {/* <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {r.firstName.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                        </div> */}
                        <img
                          src="/child.jpg"
                          alt="Teacher avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {r.firstName} {r.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-pink-400" />
                            {r.parentEmail}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                          {r.age}
                        </div>
                        <span className="text-sm text-gray-600">years</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "shadow-sm font-medium",
                        )}
                      >
                        {r.group}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{r.family}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-400" />
                          {r.emergencyContact}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {r.emergencyPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.allergies ? (
                        <Badge
                          variant="destructive"
                          className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200 shadow-sm"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {r.allergies}
                        </Badge>
                      ) : (
                        <span className="text-gray-500 italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(r)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 rounded-full transition-all duration-200 hover:scale-110"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r)}
                          className="h-8 w-8 p-0 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="text-center py-12 bg-gradient-to-r from-purple-50 to-pink-50">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl font-medium text-gray-500">No children found</p>
                <p className="text-gray-400">Try adjusting your search or add a new child</p>
              </div>
            )}
          </div>
        </Section>

        {/* Enhanced Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl bg-gradient-to-br from-white to-purple-50/50 border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white shadow-lg">
                  <User className="h-6 w-6" />
                </div>
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {editingChild ? "Edit Child Profile" : "Add New Child"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 ml-14">
                {editingChild
                  ? "Update the child's information and family details."
                  : "Enter comprehensive information for the new child enrollment."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <DialogBody className="space-y-8">
                {/* Child Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-purple-200">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Child Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="border-2 border-purple-100 focus:border-purple-400 rounded-xl"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="border-2 border-purple-100 focus:border-purple-400 rounded-xl"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        max="12"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                        className="border-2 border-purple-100 focus:border-purple-400 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group" className="text-sm font-semibold text-gray-700">
                        Group 
                      </Label>
                      <Select
                        value={formData.group}
                        onValueChange={(value) => setFormData({ ...formData, group: value })}
                      >
                        <SelectTrigger className="border-2 border-purple-100 focus:border-purple-400 rounded-xl">
                          {formData.group || "Select group"}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sunflowers">🌻 Sunflowers (3-4 years)</SelectItem>
                          <SelectItem value="Butterflies">🦋 Butterflies (4-5 years)</SelectItem>
                          <SelectItem value="Rainbows">🌈 Rainbows (5-6 years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="family" className="text-sm font-semibold text-gray-700">
                        Family Name *
                      </Label>
                      <Input
                        id="family"
                        value={formData.family}
                        onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                        required
                        className="border-2 border-purple-100 focus:border-purple-400 rounded-xl"
                        placeholder="Family surname"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-red-200">
                    <div className="p-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Medical Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies" className="text-sm font-semibold text-gray-700">
                      Allergies & Dietary Restrictions
                    </Label>
                    <Input
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="border-2 border-red-100 focus:border-red-400 rounded-xl"
                      placeholder="e.g., Peanuts, Dairy, Gluten - or leave blank if none"
                    />
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-green-200">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Emergency Contact</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-sm font-semibold text-gray-700">
                        Contact Name *
                      </Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        required
                        className="border-2 border-green-100 focus:border-green-400 rounded-xl"
                        placeholder="Primary emergency contact"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone" className="text-sm font-semibold text-gray-700">
                        Phone Number *
                      </Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        required
                        className="border-2 border-green-100 focus:border-green-400 rounded-xl"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentEmail" className="text-sm font-semibold text-gray-700">
                      Parent Email *
                    </Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      required
                      className="border-2 border-green-100 focus:border-green-400 rounded-xl"
                      placeholder="parent@email.com"
                    />
                  </div>
                </div>

                {/* Additional Notes Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="p-2 bg-gradient-to-r from-gray-100 to-blue-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Additional Notes</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                      Special Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="border-2 border-gray-100 focus:border-gray-400 rounded-xl resize-none"
                      rows={4}
                      placeholder="Any special considerations, preferences, or important information about the child..."
                    />
                  </div>
                </div>
              </DialogBody>

              <DialogFooter className="gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {editingChild ? "Update Child" : "Add Child"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Enhanced Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-gradient-to-br from-white to-red-50/50 border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white shadow-lg">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                Delete Child Profile
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 ml-12">
                Are you sure you want to delete{" "}
                <strong>
                  {childToDelete?.firstName} {childToDelete?.lastName}
                </strong>
                's profile? This action cannot be undone and will permanently remove all associated data including
                medical information and emergency contacts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  )
}
