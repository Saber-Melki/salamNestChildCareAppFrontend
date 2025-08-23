"use client"

import React from "react"
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
import { Plus, User, Phone, AlertTriangle, Edit, Trash2 } from "lucide-react"

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
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingChild, setEditingChild] = React.useState<ChildRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [childToDelete, setChildToDelete] = React.useState<ChildRow | null>(null)

  const [rows, setRows] = React.useState<ChildRow[]>([
    {
      id: "1",
      firstName: "Ava",
      lastName: "Johnson",
      family: "Johnson",
      authorizedPickups: 3,
      allergies: "Peanuts",
      age: 4,
      group: "Sunflowers",
      emergencyContact: "Sarah Johnson",
      emergencyPhone: "(555) 123-4567",
      parentEmail: "sarah@johnson.com",
      notes: "Loves art activities",
    },
    {
      id: "2",
      firstName: "Liam",
      lastName: "Garcia",
      family: "Garcia",
      authorizedPickups: 2,
      age: 3,
      group: "Butterflies",
      emergencyContact: "Maria Garcia",
      emergencyPhone: "(555) 234-5678",
      parentEmail: "maria@garcia.com",
      notes: "Very energetic",
    },
    {
      id: "3",
      firstName: "Mia",
      lastName: "Chen",
      family: "Chen",
      authorizedPickups: 1,
      allergies: "Dairy",
      age: 5,
      group: "Sunflowers",
      emergencyContact: "Li Chen",
      emergencyPhone: "(555) 345-6789",
      parentEmail: "li@chen.com",
      notes: "Quiet and thoughtful",
    },
    {
      id: "4",
      firstName: "Noah",
      lastName: "Smith",
      family: "Smith",
      authorizedPickups: 2,
      age: 4,
      group: "Butterflies",
      emergencyContact: "John Smith",
      emergencyPhone: "(555) 456-7890",
      parentEmail: "john@smith.com",
      notes: "Great with puzzles",
    },
  ])

  // Form state
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingChild) {
      // Update existing child
      setRows((prev) =>
        prev.map((row) =>
          row.id === editingChild.id
            ? {
                ...row,
                firstName: formData.firstName,
                lastName: formData.lastName,
                family: formData.family,
                age: Number.parseInt(formData.age),
                group: formData.group,
                allergies: formData.allergies || undefined,
                emergencyContact: formData.emergencyContact,
                emergencyPhone: formData.emergencyPhone,
                parentEmail: formData.parentEmail,
                notes: formData.notes,
              }
            : row,
        ),
      )
    } else {
      // Add new child
      const newChild: ChildRow = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        family: formData.family,
        authorizedPickups: 1,
        allergies: formData.allergies || undefined,
        age: Number.parseInt(formData.age),
        group: formData.group,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        parentEmail: formData.parentEmail,
        notes: formData.notes,
      }
      setRows((prev) => [...prev, newChild])
    }

    resetForm()
    setEditingChild(null)
    setDialogOpen(false)
  }

  const handleDelete = (child: ChildRow) => {
    setChildToDelete(child)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (childToDelete) {
      setRows((prev) => prev.filter((row) => row.id !== childToDelete.id))
      setChildToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const filtered = rows.filter((r) => `${r.firstName} ${r.lastName}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <AppShell title="Child Profiles">
      <Section title="Profiles" description="Family details, authorized pickups, and medical notes.">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search children"
            />
          </div>

          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-purple-500 to-pink-400 text-white border-0 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        </div>

        <div className="mt-4 rounded-xl border bg-white/70 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="flex items-center gap-3">
                    <img
                      src="/child.jpg"
                      alt={`${r.firstName} ${r.lastName} avatar`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium">
                        {r.firstName} {r.lastName}
                      </div>
                      <div className="text-xs text-neutral-500">{r.parentEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{r.age} years</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.group}</Badge>
                  </TableCell>
                  <TableCell>{r.family}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{r.emergencyContact}</div>
                      <div className="text-xs text-neutral-500">{r.emergencyPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.allergies ? (
                      <Badge variant="destructive">{r.allergies}</Badge>
                    ) : (
                      <span className="text-neutral-500">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(r)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(r)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              {editingChild ? "Edit Child" : "Add New Child"}
            </DialogTitle>
            <DialogDescription>
              {editingChild
                ? "Update the child's information and family details."
                : "Enter the child's information and family details for enrollment."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-6">
              {/* Child Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Child Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.age}
                      onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="group">Group *</Label>
                    <Select
                      value={formData.group}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, group: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        {formData.group || "Select group"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sunflowers">Sunflowers (3-4 years)</SelectItem>
                        <SelectItem value="Butterflies">Butterflies (4-5 years)</SelectItem>
                        <SelectItem value="Rainbows">Rainbows (5-6 years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="family">Family Name *</Label>
                    <Input
                      id="family"
                      value={formData.family}
                      onChange={(e) => setFormData((prev) => ({ ...prev, family: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Medical Information
                </h3>
                <div>
                  <Label htmlFor="allergies">Allergies & Dietary Restrictions</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData((prev) => ({ ...prev, allergies: e.target.value }))}
                    placeholder="e.g., Peanuts, Dairy, None"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Phone Number *</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="parentEmail">Parent Email *</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parentEmail: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about the child..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-400 text-white border-0">
                {editingChild ? "Update Child" : "Add Child"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Child Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {childToDelete?.firstName} {childToDelete?.lastName}'s record? This action
              cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete Child</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
