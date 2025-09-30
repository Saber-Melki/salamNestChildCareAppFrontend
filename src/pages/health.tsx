"use client"

import { type FormEvent, useEffect, useState } from "react"
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
import {
  Plus,
  HeartPulse,
  AlertTriangle,
  FileText,
  Edit,
  Trash2,
  Eye,
  Stethoscope,
  Shield,
  Activity,
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  NotepadText,
  FileDown,
  CheckCircle,
} from "lucide-react"
import { fetchChildren, type ChildRow } from "../services/child.service"
import { healthPDFService } from "../services/health-pdf-service"
import { useBranding } from "../contexts/branding"

interface HealthNote {
  id: string
  noteType: string
  description: string
  date: string
  followUp?: string
  childId: string
  child?: string
  createdAt?: string
  updatedAt?: string
  priority?: "low" | "medium" | "high"
  status?: "active" | "resolved" | "pending"
}

interface HealthRecord {
  id: string
  child: string
  childId: string
  allergies: string
  immunizations: string
  emergency: string
  notes: HealthNote[]
  bloodType?: string
  medications?: string[]
  lastCheckup?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

const NOTE_TYPES = [
  { value: "Incident", label: "🚨 Incident Report", color: "from-red-500 to-pink-500", bgColor: "bg-red-50" },
  { value: "Medication", label: "💊 Medication", color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50" },
  { value: "Allergy", label: "⚠️ Allergy Update", color: "from-orange-500 to-amber-500", bgColor: "bg-orange-50" },
  { value: "Immunization", label: "💉 Immunization", color: "from-green-500 to-emerald-500", bgColor: "bg-green-50" },
  { value: "Checkup", label: "🩺 Health Checkup", color: "from-purple-500 to-violet-500", bgColor: "bg-purple-50" },
  { value: "Observation", label: "👁️ Observation", color: "from-teal-500 to-cyan-500", bgColor: "bg-teal-50" },
  {
    value: "Temperature",
    label: "🌡️ Temperature Check",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
  },
  { value: "Injury", label: "🩹 Injury Report", color: "from-red-600 to-rose-600", bgColor: "bg-red-50" },
]

export default function Health() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<HealthNote | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<HealthNote | null>(null)
  const [viewNotesDialog, setViewNotesDialog] = useState(false)
  const [selectedChild, setSelectedChild] = useState<HealthRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [exportingPDF, setExportingPDF] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const [rows, setRows] = useState<HealthRecord[]>([])
  const [children, setChildren] = useState<ChildRow[]>([])
  const [loading, setLoading] = useState(true)

  // const { centerName } = useBranding()

  const childrenOptions = children.map((child) => ({
    id: child.id,
    child: `${child.firstName} ${child.lastName}`,
  }))

  const [formData, setFormData] = useState({
    childId: "",
    childName: "",
    noteType: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    followUp: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "active" as "active" | "resolved" | "pending",
  })

  // ----------- API Functions -------------
  const fetchHealthRecords = async (): Promise<HealthRecord[]> => {
    const res = await fetch("http://localhost:8080/health")
    if (!res.ok) throw new Error("Failed to fetch health records")
    return res.json()
  }

  const createHealthNote = async (note: Partial<HealthNote>) => {
    const res = await fetch("http://localhost:8080/health/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    })
    if (!res.ok) throw new Error("Failed to create health note")
    return res.json()
  }

  const updateHealthNote = async (id: string, note: Partial<HealthNote>) => {
    const res = await fetch(`http://localhost:8080/health/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...note,
        updatedAt: new Date().toISOString(),
      }),
    })
    if (!res.ok) throw new Error("Failed to update health note")
    return res.json()
  }

  const deleteHealthNote = async (id: string) => {
    const res = await fetch(`http://localhost:8080/health/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete health note")
    return res.json()
  }

  // ----------- PDF Export Function -------------
  const exportHealthRecordsPDF = async () => {
    setExportingPDF(true)
    setExportSuccess(false)

    try {
      // Generate PDF using the health PDF service with Salam Nest branding
      healthPDFService.generateHealthRecordsPDF(filteredRows, "Salam Nest")

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setExportingPDF(false)
    }
  }

  // ----------- Load Data -------------
  const loadData = async () => {
    try {
      setLoading(true)
      const [childrenData, healthData] = await Promise.all([fetchChildren(), fetchHealthRecords()])
      setChildren(childrenData)
      setRows(healthData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ----------- Handlers -------------
  const resetForm = () => {
    setFormData({
      childId: "",
      childName: "",
      noteType: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      followUp: "",
      priority: "medium",
      status: "active",
    })
  }

  const openEditDialog = (note: HealthNote) => {
    setEditingNote(note)
    setFormData({
      childId: note.childId,
      childName: note.child || "",
      noteType: note.noteType,
      description: note.description,
      date: note.date,
      followUp: note.followUp || "",
      priority: note.priority || "medium",
      status: note.status || "active",
    })
    setDialogOpen(true)
  }

  const openAddDialog = (childRecord?: HealthRecord) => {
    setEditingNote(null)
    resetForm()
    if (childRecord) {
      setFormData((prev) => ({
        ...prev,
        childId: childRecord.childId,
        childName: childRecord.child,
      }))
    }
    setDialogOpen(true)
  }

  const viewAllNotes = (record: HealthRecord) => {
    setSelectedChild(record)
    setViewNotesDialog(true)
  }

  const handleDeleteNote = (note: HealthNote) => {
    setNoteToDelete(note)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (noteToDelete) {
      try {
        await deleteHealthNote(noteToDelete.id)
        await loadData()
        setNoteToDelete(null)
      } catch (err) {
        console.error(err)
        alert("Failed to delete health note")
      }
    }
    setDeleteDialogOpen(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const selectedChild = childrenOptions.find((c) => c.id === formData.childId)
      if (!selectedChild) {
        alert("Please select a valid child!")
        return
      }

      const noteData = {
        ...formData,
        child: selectedChild.child,
      }

      if (editingNote) {
        await updateHealthNote(editingNote.id, noteData)
      } else {
        await createHealthNote(noteData)
      }

      await loadData()
      setDialogOpen(false)
      resetForm()
      setEditingNote(null)
    } catch (err) {
      console.error("Error saving health note:", err)
      alert("Failed to save health note")
    }
  }

  // Filter and search functionality
  const filteredRows = rows.filter((record) => {
    const matchesSearch = record.child.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || record.notes.some((note) => note.noteType === filterType)
    return matchesSearch && matchesFilter
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getNoteTypeIcon = (noteType: string) => {
    const type = NOTE_TYPES.find((t) => t.value === noteType)
    return type?.label.split(" ")[0] || "📝"
  }

  return (
    <AppShell title="Health Records">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Floating decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-6 left-6 w-16 h-16 bg-white/5 rounded-full blur-lg animate-bounce" />
        <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-white/10 rounded-full blur-md animate-pulse delay-1000" />

        <div className="relative p-8 md:p-12 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 animate-bounce">
              <HeartPulse className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent drop-shadow-lg">
                Health Records
              </h1>
              <p className="mt-3 text-xl text-emerald-50/90 font-medium">
                Comprehensive medical tracking, allergies, and emergency information
              </p>
              <div className="flex items-center gap-6 mt-4 text-emerald-100/80">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  <span className="text-sm font-medium">Medical Records</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Safety First</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <span className="text-sm font-medium">Health Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Section */}
      <Section
        title="Medical Records"
        description="Comprehensive health tracking with multiple notes per child, allergies, immunizations, and emergency information."
      >
        {/* Enhanced Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-3">
            <Button
              onClick={() => openAddDialog()}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Health Note
            </Button>

            <Button
              variant="outline"
              onClick={exportHealthRecordsPDF}
              disabled={exportingPDF}
              className={`border-2 transition-all duration-300 ${
                exportSuccess
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent"
              }`}
            >
              {exportingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent mr-2" />
                  Generating PDF...
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  PDF Downloaded!
                </>
              ) : (
                <>
                  <FileDown className="h-5 w-5 mr-2 text-emerald-600" />
                  Export PDF
                </>
              )}
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3 flex-1 max-w-md ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search children..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-emerald-200 focus:border-emerald-400"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 border-2 border-emerald-200 focus:border-emerald-400">
                <Filter className="h-4 w-4 mr-2" />
                {filterType === "all" ? "All Types" : filterType}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {NOTE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <span className="ml-4 text-lg text-gray-600">Loading health records...</span>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 overflow-hidden shadow-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                  <TableHead className="text-white font-semibold text-base">Child</TableHead>
                  <TableHead className="text-white font-semibold text-base">Allergies</TableHead>
                  <TableHead className="text-white font-semibold text-base">Immunizations</TableHead>
                  <TableHead className="text-white font-semibold text-base">Emergency Info</TableHead>
                  <TableHead className="text-white font-semibold text-base">Health Notes</TableHead>
                  <TableHead className="text-white font-semibold text-base">Recent Activity</TableHead>
                  <TableHead className="text-white font-semibold text-base w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((record, index) => {
                  const recentNotes = record.notes
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 3)
                  const hasHighPriorityNotes = record.notes.some((note) => note.priority === "high")

                  return (
                    <TableRow
                      key={record.id}
                      className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-emerald-25"
                      } ${hasHighPriorityNotes ? "border-l-4 border-l-red-400" : ""}`}
                    >
                      <TableCell className="font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {record.child}
                          {hasHighPriorityNotes && (
                            <Badge className="bg-red-100 text-red-800 text-xs">High Priority</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.allergies === "None" ? (
                          <span className="text-gray-500 italic">None</span>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-600 shadow-lg"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {record.allergies}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={record.immunizations.includes("Missing") ? "destructive" : "secondary"}
                          className={
                            record.immunizations.includes("Missing")
                              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                          }
                        >
                          {record.immunizations}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 max-w-[200px] truncate">{record.emergency}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                            <NotepadText className="h-3 w-3 mr-1" />
                            {record.notes.length} notes
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openAddDialog(record)}
                            className="h-7 px-2 text-xs hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 transition-colors"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {recentNotes.length > 0 ? (
                            recentNotes.map((note) => (
                              <div key={note.id} className="flex items-center gap-2 text-xs">
                                <span className="text-lg">{getNoteTypeIcon(note.noteType)}</span>
                                <span className="text-gray-600 truncate max-w-[100px]">{note.noteType}</span>
                                <Badge className={`text-xs ${getPriorityColor(note.priority || "medium")}`}>
                                  {note.priority}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs italic">No recent activity</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewAllNotes(record)}
                            className="h-8 w-8 p-0 hover:bg-emerald-100 hover:scale-110 transition-all duration-200 rounded-full"
                            title="View all notes"
                          >
                            <Eye className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openAddDialog(record)}
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:scale-110 transition-all duration-200 rounded-full"
                            title="Add new note"
                          >
                            <Plus className="h-4 w-4 text-blue-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      {/* Enhanced Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl border-0 shadow-2xl bg-gradient-to-br from-white to-emerald-50/30">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              {editingNote ? "Edit Health Note" : "Add Health Note"}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              {editingNote
                ? "Update the health note information with the latest details."
                : "Record comprehensive medical information, incidents, or health observations."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Child Selection */}
                <div className="space-y-2">
                  <Label htmlFor="child" className="text-base font-semibold text-gray-700">
                    Child *
                  </Label>
                  <Select
                    value={formData.childId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, childId: value }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-emerald-200 focus:border-emerald-400 bg-white">
                      {childrenOptions.find((c) => c.id === formData.childId)?.child || "Select child"}
                    </SelectTrigger>
                    <SelectContent>
                      {childrenOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="hover:bg-emerald-50">
                          {c.child}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Note Type */}
                <div className="space-y-2">
                  <Label htmlFor="noteType" className="text-base font-semibold text-gray-700">
                    Note Type *
                  </Label>
                  <Select
                    value={formData.noteType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, noteType: value }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-emerald-200 focus:border-emerald-400 bg-white">
                      {formData.noteType || "Select type"}
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} className={`hover:${type.bgColor}`}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-base font-semibold text-gray-700">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-400 bg-white"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-base font-semibold text-gray-700">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-emerald-200 focus:border-emerald-400 bg-white">
                      {formData.priority}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="hover:bg-green-50">
                        🟢 Low Priority
                      </SelectItem>
                      <SelectItem value="medium" className="hover:bg-yellow-50">
                        🟡 Medium Priority
                      </SelectItem>
                      <SelectItem value="high" className="hover:bg-red-50">
                        🔴 High Priority
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed information about the health note, incident, or observation..."
                  required
                  className="min-h-[120px] border-2 border-emerald-200 focus:border-emerald-400 bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Follow-up */}
                <div className="space-y-2">
                  <Label htmlFor="followUp" className="text-base font-semibold text-gray-700">
                    Follow-up Required
                  </Label>
                  <Input
                    id="followUp"
                    value={formData.followUp}
                    onChange={(e) => setFormData((prev) => ({ ...prev, followUp: e.target.value }))}
                    placeholder="Specify any follow-up actions..."
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-400 bg-white"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base font-semibold text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-emerald-200 focus:border-emerald-400 bg-white">
                      {formData.status}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="hover:bg-blue-50">
                        🔵 Active
                      </SelectItem>
                      <SelectItem value="pending" className="hover:bg-orange-50">
                        🟠 Pending
                      </SelectItem>
                      <SelectItem value="resolved" className="hover:bg-green-50">
                        🟢 Resolved
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="pt-6 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-2 border-gray-300 hover:bg-gray-50 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
              >
                {editingNote ? "Update Note" : "Add Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enhanced View Notes Dialog */}
      <Dialog open={viewNotesDialog} onOpenChange={setViewNotesDialog}>
        <DialogContent className="max-w-5xl border-0 shadow-2xl bg-gradient-to-br from-white to-emerald-50/30">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Health Notes - {selectedChild?.child}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              Complete medical history and health records for this child. Total notes:{" "}
              {selectedChild?.notes.length || 0}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {selectedChild?.notes.length ? (
                selectedChild.notes
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((note, index) => {
                    const noteType = NOTE_TYPES.find((t) => t.value === note.noteType)
                    return (
                      <div
                        key={note.id}
                        className="border-2 border-emerald-100 rounded-2xl p-6 bg-gradient-to-br from-white to-emerald-50/50 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`border-emerald-300 text-emerald-700 bg-emerald-100 font-semibold px-3 py-1 ${
                                  noteType?.bgColor
                                }`}
                              >
                                {getNoteTypeIcon(note.noteType)} {note.noteType}
                              </Badge>
                              <Badge className={`text-xs ${getPriorityColor(note.priority || "medium")}`}>
                                {note.priority || "medium"} priority
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(note.status || "active")}`}>
                                {note.status || "active"}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                <Calendar className="h-3 w-3" />
                                {note.date}
                              </div>
                              {note.createdAt && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  Created {new Date(note.createdAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <p className="text-base mb-3 text-gray-800 leading-relaxed">{note.description}</p>
                            {note.followUp && (
                              <div className="text-sm text-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl px-4 py-3">
                                <strong className="text-amber-900">Follow-up Required:</strong> {note.followUp}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setViewNotesDialog(false)
                                openEditDialog(note)
                              }}
                              className="h-10 w-10 p-0 hover:bg-blue-100 hover:scale-110 transition-all duration-200 rounded-full"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setViewNotesDialog(false)
                                handleDeleteNote(note)
                              }}
                              className="h-10 w-10 p-0 hover:bg-red-100 hover:scale-110 transition-all duration-200 rounded-full"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Health Notes Yet</h3>
                  <p className="text-gray-500 mb-4">No health notes have been recorded for this child.</p>
                  <Button
                    onClick={() => {
                      setViewNotesDialog(false)
                      openAddDialog(selectedChild)
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Note
                  </Button>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="pt-6 gap-3">
            <Button
              onClick={() => openAddDialog(selectedChild)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Note
            </Button>
            <Button onClick={() => setViewNotesDialog(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-0 shadow-2xl bg-gradient-to-br from-white to-red-50/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-xl text-red-700">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              Delete Health Note
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 mt-2">
              Are you sure you want to permanently delete this health note? This action cannot be undone and will remove
              all associated medical information.
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <strong>Note Type:</strong> {noteToDelete?.noteType}
                <br />
                <strong>Date:</strong> {noteToDelete?.date}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-2 border-gray-300 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Delete Note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
