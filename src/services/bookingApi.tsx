export type BookingSlot = {
  id: string
  parentName: string
  childName: string
  date: string
  time: string
  duration: number
  contactMethod: "in-person" | "phone" | "video"
  purpose: string
  notes: string
  status: "pending" | "confirmed" | "cancelled"
}

const API_BASE = "http://localhost:8080"

export async function fetchBookings(): Promise<BookingSlot[]> {
  const res = await fetch(`${API_BASE}/bookings`)
  if (!res.ok) throw new Error("Failed to fetch bookings")
  return res.json()
}

export async function createBooking(booking: Omit<BookingSlot, "id" | "status">): Promise<BookingSlot> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  })
  if (!res.ok) throw new Error("Failed to create booking")
  return res.json()
}

/**
 * Generic update booking (PUT /bookings/:id)
 * Used by the "Edit booking" popup
 */
export async function updateBooking(
  id: string,
  data: Partial<Omit<BookingSlot, "id">>,
): Promise<BookingSlot> {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error("Failed to update booking")
  return res.json()
}

/**
 * Update booking status using your Nest gateway routes:
 * - confirmed  -> POST /bookings/:id/confirm
 * - cancelled  -> POST /bookings/:id/cancel
 * - pending    -> PUT  /bookings/:id  with { status: "pending" }
 */
export async function updateBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled",
): Promise<BookingSlot> {
  let url = `${API_BASE}/bookings/${id}`
  let method: "POST" | "PUT" = "PUT"
  let body: any = null

  if (status === "confirmed") {
    url = `${API_BASE}/bookings/${id}/confirm`
    method = "POST"
  } else if (status === "cancelled") {
    url = `${API_BASE}/bookings/${id}/cancel`
    method = "POST"
  } else {
    method = "PUT"
    body = JSON.stringify({ status })
  }

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ?? undefined,
  })

  if (!res.ok) throw new Error("Failed to update booking")
  return res.json()
}

export async function deleteBooking(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete booking")
}

/**
 * Send booking email via your API Gateway:
 * POST /bookings/:id/email
 */
export async function sendBookingEmail(
  booking: BookingSlot,
  recipientEmail: string,
): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    const res = await fetch(`${API_BASE}/bookings/${booking.id}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: recipientEmail,
        booking: {
          parentName: booking.parentName,
          childName: booking.childName,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          contactMethod: booking.contactMethod,
          purpose: booking.purpose,
          notes: booking.notes,
          status: booking.status,
        },
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("❌ Gateway email API error:", data)
      return {
        success: false,
        error: data?.message || `Email send failed with status ${res.status}`,
      }
    }

    return {
      success: true,
      messageId: data.messageId,
    }
  } catch (error) {
    console.error("❌ Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}

/**
 * Optional: Verify email delivery.
 * Currently your backend returns a static "sent" status, which is fine.
 */
export async function verifyEmailDelivery(messageId: string): Promise<{
  delivered: boolean
  status: string
  timestamp?: string
}> {
  try {
    const res = await fetch(`${API_BASE}/bookings/email-status/${messageId}`)
    if (!res.ok) {
      return {
        delivered: false,
        status: "unknown",
      }
    }

    const data = await res.json()

    return {
      delivered: !!data.delivered,
      status: data.status || "sent",
      timestamp: data.timestamp,
    }
  } catch (error) {
    console.error("❌ Email verification error:", error)
    return {
      delivered: false,
      status: "unknown",
    }
  }
}
