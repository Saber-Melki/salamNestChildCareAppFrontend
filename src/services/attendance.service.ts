// services/attendance.service.ts
export type AttendanceRow = {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  status: "present" | "away";
  checkIn?: string; // "HH:MM"
  checkOut?: string; // "HH:MM"
}

const API_URL = "http://localhost:8080/attendance";

export const fetchAttendance = async (): Promise<AttendanceRow[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
};

export const updateAttendance = async (id: string, payload: Partial<AttendanceRow>) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to update attendance: ${res.status} ${txt}`);
  }
  return res.json();
};

export const createAttendance = async (payload: Partial<AttendanceRow>) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to create attendance: ${res.status} ${txt}`);
  }
  return res.json();
};
