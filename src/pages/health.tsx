"use client"

import { type FormEvent, useEffect, useState } from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Card, CardContent } from "../components/ui/card"
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
  Stethoscope,
  Shield,
  Activity,
  Calendar,
  User,
  Search,
  Filter,
  FileDown,
  CheckCircle,
  TrendingUp,
  Syringe,
  Pill,
  Thermometer,
  Eye,
  X,
  FolderPlus,
} from "lucide-react"
import { fetchChildren, type ChildRow } from "../services/child.service"
import { healthPDFService } from "../services/health-pdf-service"

interface HealthNote {
  id: string
  noteType: string
  description: string
  date: string
  followUp?: string
  priority?: "low" | "medium" | "high"
  status?: "active" | "resolved" | "pending"
}

interface HealthRecord {
  id: string
  child: string
  allergies: string
  immunizations: string
  emergency: string
  notes: HealthNote[]
}

const NOTE_TYPES = [
  { value: "Incident", label: "🚨 Incident Report", color: "from-red-500 to-pink-500", bgColor: "bg-red-50 dark:bg-red-950/30", icon: AlertTriangle },
  { value: "Medication", label: "💊 Medication", color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50 dark:bg-blue-950/30", icon: Pill },
  { value: "Allergy", label: "⚠️ Allergy Update", color: "from-orange-500 to-amber-500", bgColor: "bg-orange-50 dark:bg-orange-950/30", icon: Shield },
  { value: "Immunization", label: "💉 Immunization", color: "from-green-500 to-emerald-500", bgColor: "bg-green-50 dark:bg-green-950/30", icon: Syringe },
  { value: "Checkup", label: "🩺 Health Checkup", color: "from-purple-500 to-violet-500", bgColor: "bg-purple-50 dark:bg-purple-950/30", icon: Stethoscope },
  { value: "Observation", label: "👁️ Observation", color: "from-teal-500 to-cyan-500", bgColor: "bg-teal-50 dark:bg-teal-950/30", icon: Eye },
  { value: "Temperature", label: "🌡️ Temperature Check", color: "from-yellow-500 to-orange-500", bgColor: "bg-yellow-50 dark:bg-yellow-950/30", icon: Thermometer },
  { value: "Injury", label: "🩹 Injury Report", color: "from-red-600 to-rose-600", bgColor: "bg-red-50 dark:bg-red-950/30", icon: AlertTriangle },
]

export default function Health() {
  const [createRecordDialogOpen, setCreateRecordDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<HealthNote | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false) // note delete
  const [noteToDelete, setNoteToDelete] = useState<HealthNote | null>(null)
  const [medicalRecordOpen, setMedicalRecordOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [exportingPDF, setExportingPDF] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [children, setChildren] = useState<ChildRow[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ NEW: record-level delete dialog state
  const [deleteRecordOpen, setDeleteRecordOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<HealthRecord | null>(null)

  const [recordFormData, setRecordFormData] = useState({
    child: "",
    allergies: "None",
    immunizations: "Up to date",
    emergency: "",
  })

  const [noteFormData, setNoteFormData] = useState({
    noteType: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    followUp: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "active" as "active" | "resolved" | "pending",
  })

  const childrenWithoutRecords = children.filter(
    (child) => !healthRecords.find((record) => record.child === `${child.firstName} ${child.lastName}`),
  )

  // ---------------- API FUNCTIONS ----------------

  const fetchHealthRecords = async (): Promise<HealthRecord[]> => {
    const res = await fetch("http://localhost:8080/health")
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  const createHealthRecord = async (record: Partial<HealthRecord>) => {
    const res = await fetch("http://localhost:8080/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  const updateHealthRecord = async (id: string, record: Partial<HealthRecord>) => {
    const res = await fetch(`http://localhost:8080/health/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  const createHealthNote = async (healthId: string, note: Partial<HealthNote>) => {
    const res = await fetch(`http://localhost:8080/health/${healthId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  const updateHealthNote = async (healthId: string, noteId: string, note: Partial<HealthNote>) => {
    const res = await fetch(`http://localhost:8080/health/${healthId}/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  const deleteHealthNote = async (healthId: string, noteId: string) => {
    const res = await fetch(`http://localhost:8080/health/${healthId}/notes/${noteId}`, { method: "DELETE" })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  // ✅ NEW: delete a whole health record
  const deleteHealthRecord = async (id: string) => {
    const res = await fetch(`http://localhost:8080/health/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error(await res.text())
    return true
  }

  // ---------------- PDF Export ----------------
  const exportHealthRecordsPDF = async () => {
    setExportingPDF(true)
    setExportSuccess(false)
    try {
      healthPDFService.generateHealthRecordsPDF(filteredRecords, "SalamNest")
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setExportingPDF(false)
    }
  }

  // ---------------- Load Data ----------------
  const loadData = async () => {
    try {
      setLoading(true)
      const [childrenData, healthData] = await Promise.all([fetchChildren(), fetchHealthRecords()])
      setChildren(childrenData)
      setHealthRecords(healthData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------- Handlers ----------------
  const resetRecordForm = () => {
    setRecordFormData({ child: "", allergies: "None", immunizations: "Up to date", emergency: "" })
  }

  const resetNoteForm = () => {
    setNoteFormData({
      noteType: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      followUp: "",
      priority: "medium",
      status: "active",
    })
  }

  const openCreateRecordDialog = () => {
    resetRecordForm()
    setCreateRecordDialogOpen(true)
  }

  const openEditDialog = (note: HealthNote) => {
    setEditingNote(note)
    setNoteFormData({
      noteType: note.noteType,
      description: note.description,
      date: note.date,
      followUp: note.followUp || "",
      priority: (note.priority || "medium") as any,
      status: (note.status || "active") as any,
    })
    setNoteDialogOpen(true)
  }

  const openAddNoteDialog = (record: HealthRecord) => {
    setEditingNote(null)
    setSelectedRecord(record)
    resetNoteForm()
    setNoteDialogOpen(true)
  }

  const openMedicalRecord = (record: HealthRecord) => {
    setSelectedRecord(record)
    setMedicalRecordOpen(true)
  }

  const handleDeleteNote = (note: HealthNote) => {
    setNoteToDelete(note)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteNote = async () => {
    if (noteToDelete && selectedRecord) {
      try {
        await deleteHealthNote(selectedRecord.id, noteToDelete.id)
        await loadData()
        setNoteToDelete(null)
      } catch (err) {
        console.error(err)
      }
    }
    setDeleteDialogOpen(false)
  }

  // ✅ NEW: record delete handlers
  const openDeleteRecord = (record: HealthRecord) => {
    setRecordToDelete(record)
    setDeleteRecordOpen(true)
  }

  const confirmDeleteRecord = async () => {
    try {
      if (!recordToDelete) return
      await deleteHealthRecord(recordToDelete.id)
      if (medicalRecordOpen) setMedicalRecordOpen(false) // close details if open
      await loadData()
    } catch (e) {
      console.error(e)
      alert("Failed to delete medical record")
    } finally {
      setDeleteRecordOpen(false)
      setRecordToDelete(null)
    }
  }

  const handleCreateRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await createHealthRecord(recordFormData)
      await loadData()
      setCreateRecordDialogOpen(false)
      resetRecordForm()
    } catch (err) {
      console.error("Error creating health record:", err)
      alert("Failed to create health record")
    }
  }

  const handleSubmitNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      if (!selectedRecord) {
        alert("Please select a medical record!")
        return
      }
      if (editingNote) {
        await updateHealthNote(selectedRecord.id, editingNote.id, noteFormData)
      } else {
        await createHealthNote(selectedRecord.id, noteFormData)
      }
      await loadData()
      setNoteDialogOpen(false)
      resetNoteForm()
      setEditingNote(null)
    } catch (err) {
      console.error("Error saving health note:", err)
      alert("Failed to save health note")
    }
  }

  // ---------------- Filter + Search ----------------
  const filteredRecords = healthRecords.filter((record) => {
    const matchesSearch = record.child.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || record.notes.some((note) => note.noteType === filterType)
    return matchesSearch && matchesFilter
  })

  // ---------------- Helpers ----------------
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
      case "low":
        return "bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "resolved":
        return "bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
      case "pending":
        return "bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  const getNoteTypeIcon = (noteType: string) => {
    const type = NOTE_TYPES.find((t) => t.value === noteType)
    return type?.label.split(" ")[0] || "📝"
  }

  // ---------------- Stats ----------------
  const totalNotes = healthRecords.reduce((acc, record) => acc + record.notes.length, 0)
  const activeNotes = healthRecords.reduce((acc, record) => acc + record.notes.filter((n) => n.status === "active").length, 0)
  const highPriorityNotes = healthRecords.reduce((acc, record) => acc + record.notes.filter((n) => n.priority === "high").length, 0)

  return (
    <AppShell title="Health Records">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900 opacity-95 dark:opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-6 left-6 w-16 h-16 bg-white/5 rounded-full blur-lg animate-bounce" />
        <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-white/10 rounded-full blur-md animate-pulse animation-delay-1000" />

        <div className="relative p-8 md:p-12 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 animate-bounce">
              <HeartPulse className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent drop-shadow-lg">
                Medical Records
              </h1>
              <p className="mt-3 text-xl text-emerald-50/90 font-medium">
                Comprehensive health tracking with visual timeline and medical history
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 dark:bg-emerald-600 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Medical Records</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{healthRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Notes</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalNotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 dark:bg-orange-600 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Cases</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{activeNotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/50 dark:to-pink-950/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500 dark:bg-red-600 rounded-xl shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">High Priority</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-400">{highPriorityNotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section */}
      <Section
        title="Children Medical Records"
        description="Create a medical record for each child, then add notes to track their health history."
      >
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-3">
            <Button
              onClick={openCreateRecordDialog}
              disabled={childrenWithoutRecords.length === 0}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FolderPlus className="h-5 w-5 mr-2" />
              Create Medical Record
            </Button>

            <Button
              variant="outline"
              onClick={exportHealthRecordsPDF}
              disabled={exportingPDF}
              className={`border-2 transition-all duration-300 ${
                exportSuccess
                  ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                  : "border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-300 dark:hover:border-emerald-700 bg-transparent"
              }`}
            >
              {exportingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent mr-2" />
                  Generating PDF...
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  PDF Downloaded!
                </>
              ) : (
                <>
                  <FileDown className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                  Export PDF
                </>
              )}
            </Button>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3 flex-1 max-w-md ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search children..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900">
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
            <span className="ml-4 text-lg text-gray-600 dark:text-gray-400">Loading medical records...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl border-2 border-dashed border-emerald-300 dark:border-emerald-800">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FolderPlus className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Medical Records Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start creating medical records for your children to track their health history, allergies, and medical
              notes.
            </p>
            <Button
              onClick={openCreateRecordDialog}
              disabled={childrenWithoutRecords.length === 0}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl disabled:opacity-50"
            >
              <FolderPlus className="h-5 w-5 mr-2" />
              Create First Medical Record
            </Button>
            {childrenWithoutRecords.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">All children already have medical records</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => {
              const recentNotes = [...record.notes]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3)
              const hasHighPriorityNotes = record.notes.some((note) => note.priority === "high")
              const hasActiveNotes = record.notes.some((note) => note.status === "active")

              return (
                <Card
                  key={record.id}
                  className={`relative group overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer ${
                    hasHighPriorityNotes
                      ? "border-red-300 dark:border-red-800 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30"
                      : "border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/30"
                  }`}
                  onClick={() => openMedicalRecord(record)}
                >
                  {/* ✅ NEW: record delete button on card */}
                  <div className="absolute top-3 right-3 z-10">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        openDeleteRecord(record)
                      }}
                      className="h-9 w-9 p-0 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-full"
                      title="Delete medical record"
                      aria-label="Delete medical record"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>

                  {/* Priority Indicator */}
                  {hasHighPriorityNotes && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500 animate-pulse" />
                  )}

                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <img
                          src="/child.jpg"
                          alt={record.child}
                          className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                        />
                        {hasActiveNotes && (
                          <>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-ping" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                          </>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                          {record.child}
                          {hasHighPriorityNotes && (
                            <Badge className="bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 text-xs">
                              High Priority
                            </Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Last updated:{" "}
                            {record.notes.length > 0
                              ? new Date(
                                  Math.max(...record.notes.map((n) => new Date(n.date).getTime())),
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Allergies:</span>
                        {record.allergies === "None" ? (
                          <span className="text-sm text-gray-500 dark:text-gray-500 italic">None</span>
                        ) : (
                          <Badge className="bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 text-xs">
                            {record.allergies}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Syringe className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Immunizations:</span>
                        <Badge
                          className={`text-xs ${
                            record.immunizations.includes("Missing")
                              ? "bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300"
                              : "bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300"
                          }`}
                        >
                          {record.immunizations}
                        </Badge>
                      </div>
                    </div>

                    {/* Notes Count */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {record.notes.length} Medical Notes
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRecord(record)
                          openAddNoteDialog(record)
                        }}
                        className="h-7 px-2 text-xs hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>

                    {/* Recent Notes Preview */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Recent Activity
                      </p>
                      {recentNotes.length > 0 ? (
                        recentNotes.map((note) => (
                          <div
                            key={note.id}
                            className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <span className="text-lg">{getNoteTypeIcon(note.noteType)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                {note.noteType}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">{note.date}</p>
                            </div>
                            <Badge className={`text-xs ${getPriorityColor(note.priority || "medium")}`}>
                              {note.priority}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-4">
                          No medical notes yet
                        </p>
                      )}
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-2 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold bg-transparent"
                      onClick={() => openMedicalRecord(record)}
                    >
                      View Complete Medical Record
                      <Activity className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>

                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:via-teal-500/5 group-hover:to-cyan-500/5 transition-all duration-500 pointer-events-none" />
                </Card>
              )
            })}
          </div>
        )}
      </Section>

      {/* Create Medical Record Dialog */}
      <Dialog open={createRecordDialogOpen} onOpenChange={setCreateRecordDialogOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/30">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <FolderPlus className="h-6 w-6 text-white" />
              </div>
              Create Medical Record
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
              Create a new medical record for a child. You can add medical notes to this record after creation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRecord}>
            <DialogBody className="space-y-6">
              {/* Child Selection */}
              <div className="space-y-2">
                <Label htmlFor="child" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Child *
                </Label>
                <Select
                  value={recordFormData.child}
                  onValueChange={(value) => setRecordFormData((prev) => ({ ...prev, child: value }))}
                >
                  <SelectTrigger className="h-12 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900">
                    {recordFormData.child || "Select child"}
                  </SelectTrigger>
                  <SelectContent>
                    {childrenWithoutRecords.map((child) => (
                      <SelectItem
                        key={child.id}
                        value={`${child.firstName} ${child.lastName}`}
                        className="hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      >
                        {child.firstName} {child.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {childrenWithoutRecords.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">All children already have medical records</p>
                )}
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Allergies
                </Label>
                <Input
                  id="allergies"
                  value={recordFormData.allergies}
                  onChange={(e) => setRecordFormData((prev) => ({ ...prev, allergies: e.target.value }))}
                  placeholder="Enter known allergies or 'None'"
                  className="h-12 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900"
                />
              </div>

              {/* Immunizations */}
              <div className="space-y-2">
                <Label htmlFor="immunizations" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Immunizations Status
                </Label>
                <Input
                  id="immunizations"
                  value={recordFormData.immunizations}
                  onChange={(e) => setRecordFormData((prev) => ({ ...prev, immunizations: e.target.value }))}
                  placeholder="e.g., Up to date, Missing MMR, etc."
                  className="h-12 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900"
                />
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <Label htmlFor="emergency" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Emergency Contact Information *
                </Label>
                <Textarea
                  id="emergency"
                  value={recordFormData.emergency}
                  onChange={(e) => setRecordFormData((prev) => ({ ...prev, emergency: e.target.value }))}
                  placeholder="Emergency contact name, phone number, and relationship..."
                  required
                  className="min-h-[100px] border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900 resize-none"
                />
              </div>
            </DialogBody>

            <DialogFooter className="pt-6 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateRecordDialogOpen(false)}
                className="border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!recordFormData.child || !recordFormData.emergency}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 disabled:opacity-50"
              >
                Create Medical Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Medical Record Timeline Dialog */}
      <Dialog open={medicalRecordOpen} onOpenChange={setMedicalRecordOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/30">
          <DialogHeader className="pb-6 border-b border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/child.jpg"
                  alt={selectedRecord?.child || "child"}
                  className="w-16 h-16 rounded-full border-4 border-emerald-500 dark:border-emerald-700 shadow-lg"
                />
                <div>
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    {selectedRecord?.child}
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-1">
                    Complete Medical History • {selectedRecord?.notes.length || 0} Total Notes
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* ✅ Optional: record delete from dialog */}
                {selectedRecord && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteRecord(selectedRecord)}
                    className="hover:bg-red-100 dark:hover:bg-red-950/50"
                    title="Delete this medical record"
                  >
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMedicalRecordOpen(false)}
                  className="hover:bg-red-100 dark:hover:bg-red-950/50"
                  aria-label="Close medical record"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Medical Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Allergies</p>
                      <p className="text-sm font-bold text-orange-700 dark:text-orange-400">
                        {selectedRecord?.allergies || "None"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Syringe className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Immunizations</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">
                        {selectedRecord?.immunizations}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Emergency</p>
                      <p className="text-sm font-bold text-red-700 dark:text-red-400 truncate">
                        {selectedRecord?.emergency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogHeader>

          <DialogBody className="overflow-y-auto max-h-[calc(90vh-300px)] pr-4">
            {/* Timeline View */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700" />

              <div className="space-y-6">
                {selectedRecord?.notes.length ? (
                  [...selectedRecord.notes]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((note) => {
                      const noteType = NOTE_TYPES.find((t) => t.value === note.noteType)
                      const Icon = noteType?.icon || FileText

                      return (
                        <div key={note.id} className="relative pl-20">
                          <div className="absolute left-4 top-4 w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-700 dark:to-teal-700 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-lg z-10">
                            <Icon className="h-4 w-4 text-white" />
                          </div>

                          <Card className={`border-2 transition-all duration-300 hover:shadow-xl ${noteType?.bgColor}`}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className={`font-semibold px-3 py-1 text-base ${noteType?.bgColor}`}
                                    >
                                      {noteType?.label || note.noteType}
                                    </Badge>
                                    <Badge className={`text-xs ${getPriorityColor(note.priority || "medium")}`}>
                                      {note.priority || "medium"} priority
                                    </Badge>
                                    <Badge className={`text-xs ${getStatusColor(note.status || "active")}`}>
                                      {note.status || "active"}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(note.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      openEditDialog(note)
                                    }}
                                    className="h-9 w-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-950/50 hover:scale-110 transition-all duration-200 rounded-full"
                                  >
                                    <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      handleDeleteNote(note)
                                    }}
                                    className="h-9 w-9 p-0 hover:bg-red-100 dark:hover:bg-red-950/50 hover:scale-110 transition-all duration-200 rounded-full"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  </Button>
                                </div>
                              </div>

                              <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
                                {note.description}
                              </p>

                              {note.followUp && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-l-4 border-amber-400 dark:border-amber-600 rounded-r-lg">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                                        Follow-up Required
                                      </p>
                                      <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">{note.followUp}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      )
                    })
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No Medical Notes Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Start building this child's medical history</p>
                    <Button
                      onClick={() => {
                        if (selectedRecord) openAddNoteDialog(selectedRecord)
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Note
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="pt-6 gap-3 border-t border-emerald-200 dark:border-emerald-800">
            <Button
              onClick={() => {
                if (selectedRecord) openAddNoteDialog(selectedRecord)
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Medical Note
            </Button>
            <Button onClick={() => setMedicalRecordOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-3xl border-0 shadow-2xl bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/30">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              {editingNote ? "Edit Medical Note" : "Add Medical Note"}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
              {editingNote
                ? "Update the medical note information with the latest details."
                : `Adding medical note to ${selectedRecord?.child}'s record`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitNote}>
            <DialogBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Note Type */}
                <div className="space-y-2">
                  <Label htmlFor="noteType" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Note Type *
                  </Label>
                  <Select
                    value={noteFormData.noteType}
                    onValueChange={(value) => setNoteFormData((prev) => ({ ...prev, noteType: value }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900">
                      {noteFormData.noteType || "Select type"}
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
                  <Label htmlFor="date" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={noteFormData.date}
                    onChange={(e) => setNoteFormData((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    className="h-12 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Priority
                  </Label>
                  <Select
                    value={noteFormData.priority}
                    onValueChange={(value) => setNoteFormData((prev) => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900">
                      {noteFormData.priority}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="hover:bg-green-50 dark:hover:bg-green-950/50">
                        🟢 Low Priority
                      </SelectItem>
                      <SelectItem value="medium" className="hover:bg-yellow-50 dark:hover:bg-yellow-950/50">
                        🟡 Medium Priority
                      </SelectItem>
                      <SelectItem value="high" className="hover:bg-red-50 dark:hover:bg-red-950/50">
                        🔴 High Priority
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </Label>
                  <Select
                    value={noteFormData.status}
                    onValueChange={(value) => setNoteFormData((prev) => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900">
                      {noteFormData.status}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="hover:bg-blue-50 dark:hover:bg-blue-950/50">
                        🔵 Active
                      </SelectItem>
                      <SelectItem value="pending" className="hover:bg-orange-50 dark:hover:bg-orange-950/50">
                        🟠 Pending
                      </SelectItem>
                      <SelectItem value="resolved" className="hover:bg-green-50 dark:hover:bg-green-950/50">
                        🟢 Resolved
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={noteFormData.description}
                  onChange={(e) => setNoteFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed information about the medical note, incident, or observation..."
                  required
                  className="min-h-[120px] border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900 resize-none"
                />
              </div>

              {/* Follow-up */}
              <div className="space-y-2">
                <Label htmlFor="followUp" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Follow-up Required
                </Label>
                <Input
                  id="followUp"
                  value={noteFormData.followUp}
                  onChange={(e) => setNoteFormData((prev) => ({ ...prev, followUp: e.target.value }))}
                  placeholder="Specify any follow-up actions..."
                  className="h-12 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-900"
                />
              </div>
            </DialogBody>

            <DialogFooter className="pt-6 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNoteDialogOpen(false)}
                className="border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-6"
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

      {/* Delete Note Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-0 shadow-2xl bg-gradient-to-br from-white to-red-50/30 dark:from-gray-900 dark:to-red-950/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-xl text-red-700 dark:text-red-400">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              Delete Medical Note
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
              Are you sure you want to permanently delete this medical note?
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <strong>Note Type:</strong> {noteToDelete?.noteType}
                <br />
                <strong>Date:</strong> {noteToDelete?.date}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Delete Note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ NEW — Delete Record Confirmation */}
      <AlertDialog open={deleteRecordOpen} onOpenChange={setDeleteRecordOpen}>
        <AlertDialogContent className="border-0 shadow-2xl bg-gradient-to-br from-white to-red-50/30 dark:from-gray-900 dark:to-red-950/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-xl text-red-700 dark:text-red-400">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              Delete Medical Record
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
              This will permanently delete the medical record for{" "}
              <strong>{recordToDelete?.child}</strong> and <strong>all associated notes</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecord}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
