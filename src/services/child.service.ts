// services/child.service.ts
export type ChildRow = {
  child: ReactNode;
  id: string;
  firstName: string;
  lastName: string;
  family: string;
  authorizedPickups: number;
  allergies?: string;
  age: number;
  group: string;
  emergencyContact: string;
  emergencyPhone: string;
  parentEmail: string;
  notes: string;
}

const API_URL = "http://localhost:8080/children"; // Gateway URL

export const fetchChildren = async (): Promise<ChildRow[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch children");
  return res.json();
}


export const createChild = async (child: Partial<ChildRow>): Promise<ChildRow> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(child),
  });
  if (!res.ok) throw new Error("Failed to create child");
  return res.json();
}

export const updateChild = async (id: string, child: Partial<ChildRow>): Promise<ChildRow> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(child),
  });
  if (!res.ok) throw new Error("Failed to update child");
  return res.json();
}

export const deleteChild = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete child");
  return true;
}
