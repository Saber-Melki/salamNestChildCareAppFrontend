"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
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
import { Plus, Clock, Edit, Trash2, Users } from "lucide-react"

type Shift = {
  id: string
  staff: string
  day: string
  start: string
  end: string
  role: string
  notes: string
}

export default function Scheduling() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingShift, setEditingShift] = React.useState<Shift | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [shiftToDelete, setShiftToDelete] = React.useState<Shift | null>(null)

  const [shifts, setShifts] = React.useState<Shift[]>([
    {
      id: "1",
      staff: "Ms. Taylor",
      day: "Monday",
      start: "08:00",
      end: "16:00",
      role: "Lead Teacher",
      notes: "Morning circle time leader",
    },
    {
      id: "2",
      staff: "Mr. Lee",
      day: "Monday",
      start: "09:00",
      end: "17:00",
      role: "Assistant Teacher",
      notes: "Afternoon activities coordinator",
    },
    {
      id: "3",
      staff: "Ms. Rodriguez",
      day: "Tuesday",
      start: "07:30",
      end: "15:30",
      role: "Lead Teacher",
      notes: "Early arrival supervisor",
    },
    {
      id: "4",
      staff: "Ms. Johnson",
      day: "Wednesday",
      start: "10:00",
      end: "18:00",
      role: "Substitute",
      notes: "Covering for Ms. Smith",
    },
  ])

  const [formData, setFormData] = React.useState({
    staff: "",
    day: "Monday",
    start: "08:00",
    end: "16:00",
    role: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      staff: "",
      day: "Monday",
      start: "08:00",
      end: "16:00",
      role: "",
      notes: "",
    })
  }

  const openEditDialog = (shift: Shift) => {
    setEditingShift(shift)
    setFormData({
      staff: shift.staff,
      day: shift.day,
      start: shift.start,
      end: shift.end,
      role: shift.role,
      notes: shift.notes,
    })
    setDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingShift(null)
    resetForm()
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingShift) {
      // Update existing shift
      setShifts((prev) =>
        prev.map((shift) =>
          shift.id === editingShift.id
            ? {
                ...shift,
                staff: formData.staff,
                day: formData.day,
                start: formData.start,
                end: formData.end,
                role: formData.role,
                notes: formData.notes,
              }
            : shift,
        ),
      )
    } else {
      // Add new shift
      const newShift: Shift = {
        id: Date.now().toString(),
        staff: formData.staff,
        day: formData.day,
        start: formData.start,
        end: formData.end,
        role: formData.role,
        notes: formData.notes,
      }
      setShifts((prev) => [...prev, newShift])
    }

    resetForm()
    setEditingShift(null)
    setDialogOpen(false)
  }

  const handleDelete = (shift: Shift) => {
    setShiftToDelete(shift)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (shiftToDelete) {
      setShifts((prev) => prev.filter((shift) => shift.id !== shiftToDelete.id))
      setShiftToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const calculateHours = (start: string, end: string) => {
    const startTime = new Date(`2000-01-01T${start}:00`)
    const endTime = new Date(`2000-01-01T${end}:00`)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours.toFixed(1)
  }

  // Group shifts by day
  const shiftsByDay = shifts.reduce(
    (acc, shift) => {
      if (!acc[shift.day]) acc[shift.day] = []
      acc[shift.day].push(shift)
      return acc
    },
    {} as Record<string, Shift[]>,
  )

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  return (
    <AppShell title="Staff Scheduling">
      <div className="space-y-6">
        <Section title="Shift Planner" description="Manage staff availability and coverage.">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Total shifts this week: <span className="font-semibold">{shifts.length}</span>
              </div>
              <div className="text-sm text-gray-600">
                Total hours:{" "}
                <span className="font-semibold">
                  {shifts
                    .reduce((total, shift) => total + Number.parseFloat(calculateHours(shift.start, shift.end)), 0)
                    .toFixed(1)}
                </span>
              </div>
            </div>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-purple-500 to-indigo-400 text-white border-0 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Calendar View */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Weekly Schedule
              </h3>
              <div className="space-y-3">
                {weekDays.map((day) => (
                  <div key={day} className="border rounded-lg p-4 bg-white/50">
                    <div className="font-medium text-sm text-gray-700 mb-2">{day}</div>
                    <div className="space-y-2">
                      {shiftsByDay[day]?.map((shift) => (
                        <div
                          key={shift.id}
                          className="flex items-center justify-between text-sm bg-white rounded p-2 border"
                        >
                          <div>
                            <div className="font-medium">{shift.staff}</div>
                            <div className="text-xs text-gray-500">
                              {shift.start} - {shift.end} ({calculateHours(shift.start, shift.end)}h)
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(shift)}
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(shift)}
                              className="h-6 w-6 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      )) || <div className="text-xs text-gray-400 italic">No shifts scheduled</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table View */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Shifts
              </h3>
              <div className="border rounded-lg overflow-hidden bg-white/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">{shift.staff}</TableCell>
                        <TableCell>{shift.day}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {shift.start} - {shift.end}
                            <div className="text-xs text-gray-500">{calculateHours(shift.start, shift.end)} hours</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {shift.role}
                            {shift.notes && <div className="text-xs text-gray-500 mt-1">{shift.notes}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(shift)}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(shift)}
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
            </div>
          </div>
        </Section>
      </div>

      {/* Add/Edit Shift Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              {editingShift ? "Edit Shift" : "Add New Shift"}
            </DialogTitle>
            <DialogDescription>
              {editingShift ? "Update the shift details." : "Schedule a new shift for staff coverage."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              <div>
                <Label htmlFor="staff">Staff Member *</Label>
                <Input
                  id="staff"
                  value={formData.staff}
                  onChange={(e) => setFormData((prev) => ({ ...prev, staff: e.target.value }))}
                  placeholder="Enter staff name"
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="day">Day *</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, day: value }))}
                  >
                    <SelectTrigger className="mt-1">{formData.day}</SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      {formData.role || "Select role"}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead Teacher">Lead Teacher</SelectItem>
                      <SelectItem value="Assistant Teacher">Assistant Teacher</SelectItem>
                      <SelectItem value="Substitute">Substitute</SelectItem>
                      <SelectItem value="Support Staff">Support Staff</SelectItem>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start">Start Time *</Label>
                  <Input
                    id="start"
                    type="time"
                    value={formData.start}
                    onChange={(e) => setFormData((prev) => ({ ...prev, start: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="end">End Time *</Label>
                  <Input
                    id="end"
                    type="time"
                    value={formData.end}
                    onChange={(e) => setFormData((prev) => ({ ...prev, end: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {formData.start && formData.end && (
                <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                  Shift duration: {calculateHours(formData.start, formData.end)} hours
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or responsibilities..."
                  className="mt-1"
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-indigo-400 text-white border-0">
                {editingShift ? "Update Shift" : "Add Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {shiftToDelete?.staff}'s shift on {shiftToDelete?.day}? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete Shift</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
