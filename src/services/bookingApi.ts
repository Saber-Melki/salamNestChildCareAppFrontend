export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type ContactMethod = "in-person" | "phone" | "video";

export type BookingSlot = {
  id: string;
  parentName: string;
  childName: string;
  date: string;
  time: string;
  duration: number;
  contactMethod: ContactMethod;
  purpose?: string;
  notes?: string;
  status: BookingStatus;
};

// NestJS Gateway URL
const BASE_URL = "http://localhost:8080/bookings";

// ---------------- API Calls ----------------
export async function fetchBookings(): Promise<BookingSlot[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function createBooking(booking: Omit<BookingSlot, "id" | "status">): Promise<BookingSlot> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<BookingSlot> {
  const res = await fetch(`${BASE_URL}/${id}/${status}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to update booking status");
  return res.json();
}

export async function deleteBooking(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete booking");
}
