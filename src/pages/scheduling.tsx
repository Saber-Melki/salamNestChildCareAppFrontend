"use client"

import { useEffect, useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Clock, Edit, Trash2, Users, Calendar, TrendingUp, UserCheck } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"

import { getShifts, addShift, updateShift, deleteShift, type Shift } from "../services/shift.service"

type FormData = {
  staff: string
  day: string
  start: string
  end: string
  role: string
  notes: string
}

export default function Scheduling() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null)

  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<FormData>({
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

  const handleSubmit = async () => {
    console.log("Submitting formData:", formData)

    try {
      if (editingShift) {
        const updated = await updateShift(editingShift.id, formData)
        setShifts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      } else {
        await addShift(formData)
        const data = await getShifts()
        setShifts(data)
      }
      resetForm()
      setEditingShift(null)
      setDialogOpen(false)
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du shift", err)
    }
  }


  const handleDelete = (shift: Shift) => {
    setShiftToDelete(shift)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (shiftToDelete) {
      try {
        await deleteShift(shiftToDelete.id)
        setShifts((prev) => prev.filter((s) => s.id !== shiftToDelete.id))
      } catch (err) {
        console.error("Erreur lors de la suppression", err)
      }
      setShiftToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const calculateHours = (start: string, end: string) => {
    const startTime = new Date(`2000-01-01T${start}:00`)
    const endTime = new Date(`2000-01-01T${end}:00`)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffHours = diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0
    return diffHours.toFixed(1)
  }

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getShifts()
        setShifts(data)
      } catch (err) {
        console.error("Erreur chargement shifts", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const shiftsByDay = shifts.reduce(
    (acc, shift) => {
      const day = shift.day || "Monday"
      if (!acc[day]) acc[day] = []
      acc[day].push(shift)
      return acc
    },
    {} as Record<string, Shift[]>,
  )

  const totalHours = shifts.reduce(
    (total, shift) => total + Number.parseFloat(calculateHours(shift.start, shift.end)),
    0,
  )
  const uniqueStaff = new Set(shifts.map((s) => s.staff)).size

  return (
    <AppShell title="Staff Scheduling">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border shadow-lg mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 opacity-90" />
        <div className="absolute inset-0">
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute bottom-6 left-6 w-16 h-16 bg-white/5 rounded-full animate-bounce" />
          <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-300" />
        </div>
        <div className="relative p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">Staff Scheduling</h1>
              <p className="text-white/90 text-lg">Manage staff availability and coverage with precision</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold text-blue-700">{shifts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-purple-700">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-green-700">{uniqueStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Section title="Shift Planner" description="Manage staff availability and coverage.">
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-purple-500 to-indigo-400 text-white border-0 shadow-lg hover:shadow-xl transition-all "
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Calendar View */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-indigo-600" />
                Weekly Schedule
              </h3>
              <div className="space-y-3">
                {weekDays.map((day, index) => (
                  <div
                    key={day}
                    className="border rounded-xl p-4 bg-gradient-to-r from-white to-gray-50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${index === 0
                            ? "from-red-400 to-red-500"
                            : index === 1
                              ? "from-orange-400 to-orange-500"
                              : index === 2
                                ? "from-yellow-400 to-yellow-500"
                                : index === 3
                                  ? "from-green-400 to-green-500"
                                  : "from-blue-400 to-blue-500"
                          }`}
                      />
                      {day}
                    </div>
                    <div className="space-y-2">
                      {shiftsByDay[day]?.map((shift) => (
                        <div
                          key={shift.id}
                          className="flex items-center justify-between text-sm bg-white rounded-lg p-3 border shadow-sm hover:shadow-md transition-all"
                        >
                          <div>
                            <div className="font-medium text-gray-800">{shift.staff}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {shift.start} - {shift.end} ({calculateHours(shift.start, shift.end)}h)
                            </div>
                            <div className="text-xs text-indigo-600 font-medium">{shift.role}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(shift)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 rounded-full"
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(shift)}
                              className="h-8 w-8 p-0 hover:bg-red-100 rounded-full"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      )) || <div className="text-xs text-gray-400 italic p-2">No shifts scheduled</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Table View */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-purple-600" />
                All Shifts
              </h3>
              <div className="border rounded-xl overflow-hidden bg-white shadow-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50">
                      <TableHead className="font-semibold text-gray-800">Staff</TableHead>
                      <TableHead className="font-semibold text-gray-800">Day</TableHead>
                      <TableHead className="font-semibold text-gray-800">Time</TableHead>
                      <TableHead className="font-semibold text-gray-800">Position</TableHead>
                      <TableHead className="w-[80px] font-semibold text-gray-800">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.map((shift, index) => (
                      <TableRow
                        key={shift.id}
                        className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                      >
                        <TableCell className="font-medium text-gray-800">{shift.staff}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${shift.day === "Monday"
                                  ? "from-red-400 to-red-500"
                                  : shift.day === "Tuesday"
                                    ? "from-orange-400 to-orange-500"
                                    : shift.day === "Wednesday"
                                      ? "from-yellow-400 to-yellow-500"
                                      : shift.day === "Thursday"
                                        ? "from-green-400 to-green-500"
                                        : "from-blue-400 to-blue-500"
                                }`}
                            />
                            {shift.day}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {shift.start} - {shift.end}
                            </div>
                            <div className="text-xs text-gray-500">{calculateHours(shift.start, shift.end)} hours</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-indigo-600">{shift.role}</div>
                            {shift.notes && <div className="text-xs text-gray-500 mt-1">{shift.notes}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(shift)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 rounded-full"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(shift)}
                              className="h-8 w-8 p-0 hover:bg-red-100 rounded-full"
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              {editingShift ? "Edit Shift" : "Add New Shift"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingShift ? "Update the shift details." : "Schedule a new shift for staff coverage."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div>
              <Label htmlFor="staff" className="text-sm font-medium text-gray-700">
                Staff Member *
              </Label>
              <Input
                id="staff"
                value={formData.staff}
                onChange={(e) => setFormData((prev) => ({ ...prev, staff: e.target.value }))}
                placeholder="Enter staff name"
                required
                className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day" className="text-sm font-medium text-gray-700">
                  Day *
                </Label>
                <Select
                  value={formData.day}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, day: value }))}
                >
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
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
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Position *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-indigo-500">
                    <SelectValue placeholder="Select position" />
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
                <Label htmlFor="start" className="text-sm font-medium text-gray-700">
                  Start Time *
                </Label>
                <Input
                  id="start"
                  type="time"
                  value={formData.start}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start: e.target.value }))}
                  required
                  className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <Label htmlFor="end" className="text-sm font-medium text-gray-700">
                  End Time *
                </Label>
                <Input
                  id="end"
                  type="time"
                  value={formData.end}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end: e.target.value }))}
                  required
                  className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {formData.start && formData.end && (
              <div className="text-sm text-gray-600 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>
                    Shift duration:{" "}
                    <span className="font-semibold text-indigo-700">
                      {calculateHours(formData.start, formData.end)} hours
                    </span>
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes
              </Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or responsibilities..."
                className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg"
            >
              {editingShift ? "Update Shift" : "Add Shift"}
            </Button>
          </DialogFooter>
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
