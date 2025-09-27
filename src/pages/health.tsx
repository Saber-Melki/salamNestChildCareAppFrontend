"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { AppShell, Section } from "../components/app-shell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Plus, HeartPulse, AlertTriangle, FileText, Edit, Trash2, Eye, Stethoscope, Shield, Activity, Trash, Edit2Icon } from "lucide-react";
import { fetchChildren, type ChildRow } from "../services/child.service";

interface HealthNote {
  id: string;
  noteType: string;
  description: string;
  date: string;
  followUp?: string;
  childId: string;
  child?: string;
}

interface HealthRecord {
  id: string;
  child: string;
  allergies: string;
  immunizations: string;
  emergency: string;
  notes: HealthNote[];
}

export default function Health() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<HealthNote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<HealthNote | null>(null);
  const [viewNotesDialog, setViewNotesDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState<HealthRecord | null>(null);

  const [rows, setRows] = useState<HealthRecord[]>([]);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [loading, setLoading] = useState(true);

  const childrenOptions = children.map((child) => ({
    id: child.id,
    child: `${child.firstName} ${child.lastName}`,
  }));

  const [formData, setFormData] = useState({
    childId: "",
    childName: "",
    noteType: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    followUp: "",
  });

  // ----------- API Functions -------------

  const fetchHealthRecords = async (): Promise<HealthRecord[]> => {
    const res = await fetch("http://localhost:8080/health");
    if (!res.ok) throw new Error("Failed to fetch health records");
    return res.json();
  };

  const createHealthNote = async (note: Partial<HealthNote>) => {
  const res = await fetch("http://localhost:8080/health/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create health note");
  return res.json();
};


  const updateHealthNote = async (id: string, note: Partial<HealthNote>) => {
    const res = await fetch(`http://localhost:8080/health/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error("Failed to update health note");
    return res.json();
  };

  const deleteHealthNote = async (id: string) => {
    const res = await fetch(`http://localhost:8080/health/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete health note");
    return res.json();
  };

  // ----------- Load Data -------------

  const loadData = async () => {
    try {
      setLoading(true);
      const [childrenData, healthData] = await Promise.all([fetchChildren(), fetchHealthRecords()]);
      setChildren(childrenData);
      setRows(healthData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------- Handlers -------------
  const resetForm = () => {
    setFormData({
      childId: "",
      childName: "",
      noteType: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      followUp: "",
    });
  };

  const openEditDialog = (note: HealthNote) => {
    setEditingNote(note);
    setFormData({
      childId: note.childId,
      childName: note.child || "",
      noteType: note.noteType,
      description: note.description,
      date: note.date,
      followUp: note.followUp || "",
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingNote(null);
    resetForm();
    setDialogOpen(true);
  };

  const editNote = (r: HealthRecord) => {
    if (r.notes.length > 0) {
      openEditDialog(r.notes[0]); // 👉 ici tu peux choisir quel note éditer (ex: le premier)
    } else {
      alert("Aucune note à modifier pour cet enfant.");
    }
  };

  const deleteNote = (r: HealthRecord) => {
    if (r.notes.length > 0) {
      handleDeleteNote(r.notes[0]); // 👉 supprime aussi la première note trouvée
    } else {
      alert("Aucune note à supprimer pour cet enfant.");
    }
  };


  function viewAllNotes(r: HealthRecord): void {
    throw new Error("Function not implemented.");
  }

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  try {
    if (editingNote) {
      // --- UPDATE NOTE ---
      const updated = await updateHealthNote(editingNote.id, formData);

      setRows((prev) =>
        prev.map((r) =>
          r.id === formData.childId
            ? {
                ...r,
                notes: r.notes.map((n) =>
                  n.id === editingNote.id
                    ? {
                        ...updated,
                        child:
                          childrenOptions.find((c) => c.id === formData.childId)?.child ||
                          r.child, // fallback
                      }
                    : n
                ),
              }
            : r
        )
      );
    } else {
      // --- CREATE NOTE ---
      const created = await createHealthNote(formData);

      setRows((prev) =>
        prev.map((r) =>
          r.id === formData.childId
            ? {
                ...r,
                notes: [
                  ...r.notes,
                  {
                    ...created,
                    child:
                      childrenOptions.find((c) => c.id === formData.childId)?.child ||
                      r.child, // fallback
                  },
                ],
              }
            : r
        )
      );
    }

    setDialogOpen(false);
    resetForm();
  } catch (err) {
    console.error("Error saving health note:", err);
    alert("Failed to save health note");
  }
};



  function handleDeleteNote(note: HealthNote): void {
    throw new Error("Function not implemented.");
  }

  function confirmDelete(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.");
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
        description="Comprehensive health tracking with allergies, immunizations, and emergency information."
      >
        <div className="flex gap-3 mb-6">
          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Health Note
          </Button>

          <Button
            variant="outline"
            className="border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 bg-transparent"
          >
            <FileText className="h-5 w-5 mr-2 text-emerald-600" />
            Download Summary PDF
          </Button>
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
                  <TableHead className="text-white font-semibold text-base">Notes</TableHead>
                  <TableHead className="text-white font-semibold text-base w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, index) => (
                  <TableRow
                    key={r.id}
                    className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-emerald-25"
                    }`}
                  >
                    <TableCell className="font-semibold text-gray-800">{r.child}</TableCell>
                    <TableCell>
                      {r.allergies === "None" ? (
                        <span className="text-gray-500 italic">None</span>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-600 shadow-lg"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {r.allergies}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={r.immunizations.includes("Missing") ? "destructive" : "secondary"}
                        className={
                          r.immunizations.includes("Missing")
                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        }
                      >
                        {r.immunizations}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{r.emergency}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                          {r.notes.length} notes
                        </Badge>
                        {/* <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewAllNotes(r)}
                          className="h-7 px-3 text-xs hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          View All
                        </Button> */}
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-2">
  <Button
    size="sm"
    variant="ghost"
    onClick={() => viewAllNotes(r)}
    className="h-9 w-9 p-0 hover:bg-emerald-100 hover:scale-110 transition-all duration-200 rounded-full"
    aria-label="View all notes"
  >
    <Eye className="h-4 w-4 text-emerald-600" />
  </Button>

  <Button
    size="sm"
    variant="ghost"
    onClick={() => editNote(r)}
    className="h-7 px-3 text-xs hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 transition-colors"
    aria-label="Edit note"
  >
    <Edit2Icon className="h-4 w-4 text-emerald-600" />
  </Button>

  <Button
    size="sm"
    variant="ghost"
    onClick={() => deleteNote(r)}
    className="h-7 px-3 text-xs hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 transition-colors"
    aria-label="Delete note"
  >
    <Trash className="h-4 w-4 text-emerald-600" />
  </Button>
</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      {/* Enhanced Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-emerald-50/30">
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
                      <SelectItem key={c.id} value={c.id} className="hover:bg-emerald-400">
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
                    <SelectItem value="Incident" className="hover:bg-red-50">
                      🚨 Incident Report
                    </SelectItem>
                    <SelectItem value="Medication" className="hover:bg-blue-50">
                      💊 Medication Administration
                    </SelectItem>
                    <SelectItem value="Allergy" className="hover:bg-orange-50">
                      ⚠️ Allergy Update
                    </SelectItem>
                    <SelectItem value="Immunization" className="hover:bg-green-50">
                      💉 Immunization Record
                    </SelectItem>
                    <SelectItem value="Checkup" className="hover:bg-purple-50">
                      🩺 Health Checkup
                    </SelectItem>
                    <SelectItem value="Observation" className="hover:bg-teal-50">
                      👁️ Health Observation
                    </SelectItem>
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

              {/* Follow-up */}
              <div className="space-y-2">
                <Label htmlFor="followUp" className="text-base font-semibold text-gray-700">
                  Follow-up Required
                </Label>
                <Input
                  id="followUp"
                  value={formData.followUp}
                  onChange={(e) => setFormData((prev) => ({ ...prev, followUp: e.target.value }))}
                  placeholder="Specify any follow-up actions or monitoring needed..."
                  className="h-12 border-2 border-emerald-200 focus:border-emerald-400 bg-white"
                />
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
        <DialogContent className="max-w-4xl border-0 shadow-2xl bg-gradient-to-br from-white to-emerald-50/30">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Health Notes - {selectedChild?.child}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              Complete medical history and health records for this child.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {selectedChild?.notes.length ? (
                selectedChild.notes.map((note, index) => (
                  <div
                    key={note.id}
                    className="border-2 border-emerald-100 rounded-2xl p-6 bg-gradient-to-br from-white to-emerald-50/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 bg-emerald-100 font-semibold px-3 py-1"
                          >
                            {note.noteType}
                          </Badge>
                          <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                            {note.date}
                          </span>
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
                          onClick={() => openEditDialog(note)}
                          className="h-10 w-10 p-0 hover:bg-blue-100 hover:scale-110 transition-all duration-200 rounded-full"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNote(note)}
                          className="h-10 w-10 p-0 hover:bg-red-100 hover:scale-110 transition-all duration-200 rounded-full"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Health Notes Yet</h3>
                  <p className="text-gray-500">No health notes have been recorded for this child.</p>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="pt-6">
            <Button
              onClick={() => setViewNotesDialog(false)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8"
            >
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
  );
}
