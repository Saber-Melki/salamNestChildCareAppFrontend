// services/health.ts

export type HealthNote = {
  childId: string;
  id: string;
  child: string;
  noteType: string;
  description: string;
  date: string;
  followUp: string;
  healthId?: string; // utilisé lors de la création
};

export type HealthRecord = {
  id: string;
  child: string;
  allergies: string;
  immunizations: string;
  emergency: string;
  notes: HealthNote[];
};

// URL de ton API Gateway
const API_URL = "http://localhost:8080"; // Gateway URL

// ---------------------------------------------------
// GET all health records
export const fetchHealthRecords = async (): Promise<HealthRecord[]> => {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error("Failed to fetch health records");
  return res.json();
};

// GET all children (pour le select)
export const fetchChildren = async (): Promise<{ id: string; child: string }[]> => {
  const res = await fetch(`${API_URL}/children`);
  if (!res.ok) throw new Error("Failed to fetch children");
  return res.json();
};

// CREATE new health note
export const createHealthNote = async (note: HealthNote): Promise<HealthNote> => {
  if (!note.healthId) throw new Error("healthId is required to create note");
  const res = await fetch(`${API_URL}/health/${note.healthId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create health note");
  return res.json();
};

// UPDATE health note
export const updateHealthNote = async (id: string, note: Partial<HealthNote>): Promise<HealthNote> => {
  const res = await fetch(`${API_URL}/health/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to update health note");
  return res.json();
};

// DELETE health note
export const deleteHealthNote = async (id: string): Promise<boolean> => {
  const res = await fetch(`${API_URL}/health/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete health note");
  return true;
};
export function createHealthRecord(newRecord: HealthRecord): HealthRecord | PromiseLike<HealthRecord | undefined> | undefined {
  throw new Error("Function not implemented.");
}

