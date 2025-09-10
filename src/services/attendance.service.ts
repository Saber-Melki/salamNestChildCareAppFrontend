export type AttendanceRow = {
  id: string
  childId: string
  status: "present" | "away"
  checkIn?: string
  checkOut?: string
}

const API_URL = "http://localhost:8080/attendance" // Gateway URL

// Fetch all attendance rows
export const fetchAttendance = async (): Promise<AttendanceRow[]> => {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error("Failed to fetch attendance")
  return res.json()
}

// Create new attendance record
export const createAttendance = async (
  attendance: Partial<AttendanceRow>
): Promise<AttendanceRow> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attendance),
  })
  if (!res.ok) throw new Error("Failed to create attendance")
  return res.json()
}

// Update existing attendance
export const updateAttendance = async (
  id: string,
  attendance: Partial<AttendanceRow>
): Promise<AttendanceRow> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attendance),
  })
  if (!res.ok) throw new Error("Failed to update attendance")
  return res.json()
}

// Delete attendance record
export const deleteAttendance = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete attendance")
  return true
}
