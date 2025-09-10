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
import { Plus, User, Phone, AlertTriangle, Edit, Trash2, Sparkles, User2, Users } from "lucide-react"

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
      <div className="relative overflow-hidden rounded-2xl border shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-400 opacity-90" />
      <div className="relative p-6 md:p-8 text-white">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center bg-white/20 backdrop-blur-md rounded-lg shadow-md ">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
              Child Profiles
            </h1>
            <p className="mt-1 text-white/90">
              Family details, authorized pickups, and medical notes.
            </p>
          </div>

        </div>
      </div>
    </div>
    <br />
      {/* Search & Add */}
      <Section title="Profiles" description="Family details, authorized pickups, and medical notes.">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search children..." />
          </div>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-purple-500 to-pink-400 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        </div>

        {/* Children Table */}
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="flex items-center gap-3">
                    <img src="/child.jpg" alt={`${r.firstName} avatar`} width={40} height={40} className="rounded-full" />
                    <div>
                      <div className="font-medium">{r.firstName} {r.lastName}</div>
                      <div className="text-xs text-neutral-500">{r.parentEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{r.age} years</TableCell>
                  <TableCell><Badge variant="secondary">{r.group}</Badge></TableCell>
                  <TableCell>{r.family}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{r.emergencyContact}</div>
                      <div className="text-xs text-neutral-500">{r.emergencyPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.allergies ? <Badge variant="destructive">{r.allergies}</Badge> : <span className="text-neutral-500">None</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(r)}>
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(r)}>
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
            <DialogDescription>Enter the child's information and family details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="group">Group *</Label>
                  <Select value={formData.group} onValueChange={(value) => setFormData({ ...formData, group: value })}>
                    <SelectTrigger>{formData.group || "Select group"}</SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunflowers">Sunflowers</SelectItem>
                      <SelectItem value="Butterflies">Butterflies</SelectItem>
                      <SelectItem value="Rainbows">Rainbows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="family">Family *</Label>
                  <Input id="family" value={formData.family} onChange={(e) => setFormData({ ...formData, family: e.target.value })} required />
                </div>
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Input id="allergies" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                  <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone *</Label>
                  <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} required />
                </div>
              </div>

              <div>
                <Label htmlFor="parentEmail">Parent Email *</Label>
                <Input id="parentEmail" type="email" value={formData.parentEmail} onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })} required />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-400 text-white border-0">{editingChild ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Child</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {childToDelete?.firstName}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
