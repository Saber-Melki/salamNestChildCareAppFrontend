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
import { Plus, HeartPulse, AlertTriangle, FileText, Edit, Trash2, Eye } from "lucide-react"

type HealthNote = {
  id: string
  child: string
  noteType: string
  description: string
  date: string
  followUp: string
}

type HealthRecord = {
  id: string
  child: string
  allergies: string
  immunizations: string
  emergency: string
  notes: HealthNote[]
}

export default function Health() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingNote, setEditingNote] = React.useState<HealthNote | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [noteToDelete, setNoteToDelete] = React.useState<HealthNote | null>(null)
  const [viewNotesDialog, setViewNotesDialog] = React.useState(false)
  const [selectedChild, setSelectedChild] = React.useState<HealthRecord | null>(null)

  const [rows, setRows] = React.useState<HealthRecord[]>([
    {
      id: "1",
      child: "Haroun Said",
      allergies: "Peanuts",
      immunizations: "Up to date",
      emergency: "EpiPen in office",
      notes: [
        {
          id: "n1",
          child: "Haroun Said",
          noteType: "Allergy",
          description: "Severe peanut allergy - EpiPen required",
          date: "2024-01-15",
          followUp: "Monitor closely during snack time",
        },
        {
          id: "n2",
          child: "Haroun Said",
          noteType: "Checkup",
          description: "Annual physical completed - all normal",
          date: "2024-02-01",
          followUp: "",
        },
      ],
    },
    {
      id: "2",
      child: "Maya Ouni",
      allergies: "Dairy",
      immunizations: "Missing Flu",
      emergency: "N/A",
      notes: [
        {
          id: "n3",
          child: "Maya Ouni",
          noteType: "Allergy",
          description: "Lactose intolerant - dairy-free meals required",
          date: "2024-01-10",
          followUp: "Coordinate with kitchen staff",
        },
      ],
    },
    {
      id: "3",
      child: "Joud Limem",
      allergies: "None",
      immunizations: "Up to date",
      emergency: "N/A",
      notes: [
        {
          id: "n4",
          child: "Joud Limem",
          noteType: "Checkup",
          description: "No known allergies - annual physical completed",
          date: "2024-01-20",
          followUp: "",
        },
      ],
    },
  ])

  const [formData, setFormData] = React.useState({
    child: "",
    noteType: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    followUp: "",
  })

  const resetForm = () => {
    setFormData({
      child: "",
      noteType: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      followUp: "",
    })
  }

  const openEditDialog = (note: HealthNote) => {
    setEditingNote(note)
    setFormData({
      child: note.child,
      noteType: note.noteType,
      description: note.description,
      date: note.date,
      followUp: note.followUp,
    })
    setDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingNote(null)
    resetForm()
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingNote) {
      // Update existing note
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          notes: row.notes.map((note) =>
            note.id === editingNote.id
              ? {
                  ...note,
                  child: formData.child,
                  noteType: formData.noteType,
                  description: formData.description,
                  date: formData.date,
                  followUp: formData.followUp,
                }
              : note,
          ),
        })),
      )
    } else {
      // Add new note
      const newNote: HealthNote = {
        id: `n${Date.now()}`,
        child: formData.child,
        noteType: formData.noteType,
        description: formData.description,
        date: formData.date,
        followUp: formData.followUp,
      }

      setRows((prev) =>
        prev.map((row) => (row.child === formData.child ? { ...row, notes: [...row.notes, newNote] } : row)),
      )
    }

    resetForm()
    setEditingNote(null)
    setDialogOpen(false)
  }

  const handleDeleteNote = (note: HealthNote) => {
    setNoteToDelete(note)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (noteToDelete) {
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          notes: row.notes.filter((note) => note.id !== noteToDelete.id),
        })),
      )
      setNoteToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const viewAllNotes = (child: HealthRecord) => {
    setSelectedChild(child)
    setViewNotesDialog(true)
  }

  return (
    <AppShell title="Health Records">
      <Section title="Medical Records" description="Allergies, immunizations, and emergency information.">
        <div className="flex gap-2 mb-3">
          <Button
            onClick={openAddDialog}
            size="sm"
            className="bg-gradient-to-r from-rose-500 to-pink-400 text-white border-0 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Health Note
          </Button>

          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Download Summary PDF
          </Button>
        </div>

        <div className="rounded-xl border bg-white/70 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead>Immunizations</TableHead>
                <TableHead>Emergency Info</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.child}</TableCell>
                  <TableCell>
                    {r.allergies === "None" ? (
                      <span className="text-neutral-500">None</span>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {r.allergies}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.immunizations.includes("Missing") ? "destructive" : "secondary"}>
                      {r.immunizations}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.emergency}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{r.notes.length} notes</Badge>
                      <Button size="sm" variant="ghost" onClick={() => viewAllNotes(r)} className="h-6 px-2 text-xs">
                        View All
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewAllNotes(r)}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* Add/Edit Health Note Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-600" />
              {editingNote ? "Edit Health Note" : "Add Health Note"}
            </DialogTitle>
            <DialogDescription>
              {editingNote
                ? "Update the health note information."
                : "Record medical information, incidents, or health observations."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              <div>
                <Label htmlFor="child">Child *</Label>
                <Select
                  value={formData.child}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, child: value }))}
                >
                  <SelectTrigger className="mt-1">
                    {formData.child || "Select child"}
                  </SelectTrigger>
                  <SelectContent>
                    {rows.map((row) => (
                      <SelectItem key={row.id} value={row.child}>
                        {row.child}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="noteType">Note Type *</Label>
                <Select
                  value={formData.noteType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, noteType: value }))}
                >
                  <SelectTrigger className="mt-1">
                    {formData.noteType || "Select type"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Incident">Incident Report</SelectItem>
                    <SelectItem value="Medication">Medication Administration</SelectItem>
                    <SelectItem value="Allergy">Allergy Update</SelectItem>
                    <SelectItem value="Immunization">Immunization Record</SelectItem>
                    <SelectItem value="Checkup">Health Checkup</SelectItem>
                    <SelectItem value="Observation">Health Observation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the health note, incident, or observation..."
                  required
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="followUp">Follow-up Required</Label>
                <Input
                  id="followUp"
                  value={formData.followUp}
                  onChange={(e) => setFormData((prev) => ({ ...prev, followUp: e.target.value }))}
                  placeholder="Any follow-up actions needed..."
                  className="mt-1"
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-rose-500 to-pink-400 text-white border-0">
                {editingNote ? "Update Note" : "Add Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View All Notes Dialog */}
      <Dialog open={viewNotesDialog} onOpenChange={setViewNotesDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Health Notes - {selectedChild?.child}
            </DialogTitle>
            <DialogDescription>All health notes and medical records for this child.</DialogDescription>
          </DialogHeader>

          <DialogBody className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              {selectedChild?.notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4 bg-white/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{note.noteType}</Badge>
                        <span className="text-sm text-gray-500">{note.date}</span>
                      </div>
                      <p className="text-sm mb-2">{note.description}</p>
                      {note.followUp && (
                        <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                          <strong>Follow-up:</strong> {note.followUp}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(note)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {selectedChild?.notes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No health notes recorded for this child yet.</p>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button onClick={() => setViewNotesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Health Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this health note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete Note</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
