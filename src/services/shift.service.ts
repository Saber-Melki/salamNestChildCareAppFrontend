export type Shift = {
  id: string
  staff: string
  day: string
  start: string
  end: string
  role: string
  notes: string
}

const API_URL = "http://localhost:8080/shift" // ✅ microservice NestJS

// Récupérer tous les shifts
export async function getShifts(): Promise<Shift[]> {
  const res = await fetch(API_URL, { method: "GET" })
  if (!res.ok) throw new Error("Erreur lors du chargement des shifts")
  return res.json()
}

// Ajouter un shift
export async function addShift(data: Omit<Shift, "id">): Promise<Shift> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Erreur lors de l’ajout du shift")
  return res.json()
}

// Modifier un shift
export async function updateShift(id: string, data: Omit<Shift, "id">): Promise<Shift> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Erreur lors de la mise à jour du shift")
  return res.json()
}

// Supprimer un shift
export async function deleteShift(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Erreur lors de la suppression du shift")
}
