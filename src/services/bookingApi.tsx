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

// Resend API Configuration - Direct Integration
const RESEND_API_KEY = "re_djXeodt5_EneQPEJ6HVZbnfZgRuNK6oMb"
const FROM_EMAIL = "saidadridiwic@gmail.com"

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

export async function updateBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled",
): Promise<BookingSlot> {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
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

// Format booking details into beautiful HTML email
function formatBookingEmailHTML(booking: BookingSlot): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content { 
            padding: 40px 30px;
          }
          .detail-row { 
            background: #f9fafb; 
            padding: 16px 20px; 
            margin: 12px 0; 
            border-radius: 8px; 
            border-left: 4px solid #667eea;
            display: flex;
            align-items: start;
          }
          .detail-icon {
            font-size: 20px;
            margin-right: 12px;
            min-width: 24px;
          }
          .detail-content {
            flex: 1;
          }
          .detail-label { 
            font-weight: 600; 
            color: #667eea; 
            margin-bottom: 4px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .detail-value { 
            color: #1f2937;
            font-size: 16px;
            font-weight: 500;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            color: #6b7280; 
            font-size: 14px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 8px 0;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 8px;
          }
          .status-confirmed {
            background-color: #d1fae5;
            color: #065f46;
          }
          .status-pending {
            background-color: #fef3c7;
            color: #92400e;
          }
          @media only screen and (max-width: 600px) {
            .content { padding: 30px 20px; }
            .header { padding: 30px 20px; }
            .header h1 { font-size: 24px; }
            .detail-row { padding: 14px 16px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Meeting Confirmation</h1>
            <p>Your meeting has been scheduled successfully!</p>
          </div>
          <div class="content">
            <div class="detail-row">
              <div class="detail-icon">👨‍👩‍👧</div>
              <div class="detail-content">
                <div class="detail-label">Parent Name</div>
                <div class="detail-value">${booking.parentName}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">👶</div>
              <div class="detail-content">
                <div class="detail-label">Child Name</div>
                <div class="detail-value">${booking.childName}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">📅</div>
              <div class="detail-content">
                <div class="detail-label">Meeting Date</div>
                <div class="detail-value">${new Date(booking.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">🕐</div>
              <div class="detail-content">
                <div class="detail-label">Meeting Time</div>
                <div class="detail-value">${booking.time}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">⏱️</div>
              <div class="detail-content">
                <div class="detail-label">Duration</div>
                <div class="detail-value">${booking.duration} minutes</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">📱</div>
              <div class="detail-content">
                <div class="detail-label">Meeting Type</div>
                <div class="detail-value">${
                  booking.contactMethod === "in-person"
                    ? "In Person Meeting"
                    : booking.contactMethod === "phone"
                      ? "Phone Call"
                      : "Video Conference"
                }</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">📝</div>
              <div class="detail-content">
                <div class="detail-label">Meeting Purpose</div>
                <div class="detail-value">${booking.purpose}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-icon">✅</div>
              <div class="detail-content">
                <div class="detail-label">Booking Status</div>
                <div class="detail-value">
                  <span class="status-badge status-${booking.status}">
                    ${booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            ${
              booking.notes
                ? `
            <div class="detail-row">
              <div class="detail-icon">💬</div>
              <div class="detail-content">
                <div class="detail-label">Additional Notes</div>
                <div class="detail-value">${booking.notes}</div>
              </div>
            </div>
            `
                : ""
            }
            
            <div class="divider"></div>
            
            <div style="background: linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; color: #4c1d95; font-size: 18px;">📋 What to Expect</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                <li style="margin: 8px 0;">Please arrive 5 minutes early for in-person meetings</li>
                <li style="margin: 8px 0;">For video calls, a link will be sent separately</li>
                <li style="margin: 8px 0;">Feel free to bring any questions or concerns</li>
                <li style="margin: 8px 0;">Need to reschedule? Contact us at least 24 hours in advance</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                If you have any questions, please don't hesitate to reach out.
              </p>
            </div>
          </div>
          <div class="footer">
            <p><strong>📧 This is an automated confirmation email.</strong></p>
            <p>Please do not reply to this message.</p>
            <p>For assistance, please contact the childcare center directly.</p>
            <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} Childcare Management System. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Format booking details into plain text email
function formatBookingEmailText(booking: BookingSlot): string {
  return `
Meeting Confirmation - ${booking.childName}

Your meeting has been scheduled successfully!

BOOKING DETAILS:
================
Parent Name: ${booking.parentName}
Child Name: ${booking.childName}
Date: ${new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Time: ${booking.time}
Duration: ${booking.duration} minutes
Meeting Type: ${booking.contactMethod === "in-person" ? "In Person" : booking.contactMethod === "phone" ? "Phone Call" : "Video Conference"}
Purpose: ${booking.purpose}
Status: ${booking.status.toUpperCase()}
${booking.notes ? `Notes: ${booking.notes}` : ""}

WHAT TO EXPECT:
===============
- Please arrive 5 minutes early for in-person meetings
- For video calls, a link will be sent separately
- Feel free to bring any questions or concerns
- If you need to reschedule, please contact us at least 24 hours in advance

If you have any questions, please don't hesitate to reach out.

---
This is an automated confirmation email. Please do not reply.
© ${new Date().getFullYear()} Childcare Management System
  `
}

// Send booking email directly via Resend API
export async function sendBookingEmail(
  booking: BookingSlot,
  recipientEmail: string,
): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    console.log("📧 Sending email via Resend API to:", recipientEmail)

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipientEmail,
        subject: `Meeting Confirmation - ${booking.childName} (${new Date(booking.date).toLocaleDateString()})`,
        html: formatBookingEmailHTML(booking),
        text: formatBookingEmailText(booking),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("❌ Resend API Error:", data)
      throw new Error(data.message || `Email send failed with status ${response.status}`)
    }

    console.log("✅ Email sent successfully! Message ID:", data.id)

    return {
      success: true,
      messageId: data.id,
    }
  } catch (error) {
    console.error("❌ Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}

// Verify email delivery status via Resend API
export async function verifyEmailDelivery(messageId: string): Promise<{
  delivered: boolean
  status: string
  timestamp?: string
}> {
  try {
    const response = await fetch(`https://api.resend.com/emails/${messageId}`, {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to verify email status")
    }

    const data = await response.json()

    return {
      delivered: data.last_event === "delivered",
      status: data.last_event || "sent",
      timestamp: data.created_at,
    }
  } catch (error) {
    console.error("❌ Email verification error:", error)
    return {
      delivered: false,
      status: "unknown",
    }
  }
}
