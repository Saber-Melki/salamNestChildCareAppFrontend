"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  Users,
  Phone,
  Video,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  Sparkles,
  Star,
  Heart,
  Plus,
  Mail,
  Check,
  AlertCircle,
} from "lucide-react"
import { format } from "../utils/date-utils"
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
  type BookingSlot,
  createBooking,
  deleteBooking,
  fetchBookings,
  updateBookingStatus,
  sendBookingEmail,
  verifyEmailDelivery,
} from "../services/bookingApi"
import { cn } from "../lib/utils"
import { useToast } from "../hooks/useToast"
import { Toast, ToastContainer } from "../components/ui/toast"

// ---------------- Data ----------------
const meetingPurposes = [
  { value: "progress", label: "Progress Discussion" },
  { value: "behavior", label: "Behavior Update" },
  { value: "performance", label: "Performance Review" },
  { value: "other", label: "Other" },
]

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]

// ---------------- Component ----------------
export default function BookingPage() {
  const today = new Date()
  const { toasts, toast, removeToast } = useToast()

  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [selectedBookingForEmail, setSelectedBookingForEmail] = useState<BookingSlot | null>(null)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{
    sent: boolean
    verified: boolean
    messageId?: string
  } | null>(null)

  const [bookingForm, setBookingForm] = useState<Omit<BookingSlot, "id" | "status">>({
    parentName: "",
    childName: "",
    date: "",
    time: "",
    duration: 30,
    contactMethod: "in-person",
    purpose: "",
    notes: "",
  })

  // Load bookings
  useEffect(() => {
    setLoading(true)
    fetchBookings()
      .then(setBookingSlots)
      .catch((error) => {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "error",
        })
      })
      .finally(() => setLoading(false))
  }, [])

  // Available time slots
  function getAvailableTimeSlots(date: string) {
    const bookedTimes = bookingSlots.filter((b) => b.date === date && b.status !== "cancelled").map((b) => b.time)
    return timeSlots.filter((t) => !bookedTimes.includes(t))
  }

  // Save booking
  async function handleSaveBooking() {
    if (!bookingForm.parentName || !bookingForm.childName || !bookingForm.date || !bookingForm.time) return
    try {
      const newBooking = await createBooking(bookingForm)
      setBookingSlots((prev) => [...prev, newBooking])
      setBookingForm({
        parentName: "",
        childName: "",
        date: "",
        time: "",
        duration: 30,
        contactMethod: "in-person",
        purpose: "",
        notes: "",
      })
      toast({
        title: "Success!",
        description: "Meeting booking created successfully",
        variant: "success",
      })
    } catch (err) {
      console.error("Error creating booking:", err)
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "error",
      })
    }
  }

  // Update booking status
  async function handleStatusUpdate(id: string, status: "pending" | "confirmed" | "cancelled") {
    try {
      const updated = await updateBookingStatus(id, status)
      setBookingSlots((prev) => prev.map((b) => (b.id === id ? updated : b)))
      toast({
        title: "Status Updated",
        description: `Booking ${status} successfully`,
        variant: "success",
      })
    } catch (err) {
      console.error("Error updating booking:", err)
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "error",
      })
    }
  }

  // Delete booking
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this booking?")) return
    try {
      await deleteBooking(id)
      setBookingSlots((prev) => prev.filter((b) => b.id !== id))
      toast({
        title: "Deleted",
        description: "Booking deleted successfully",
        variant: "success",
      })
    } catch (err) {
      console.error("Error deleting booking:", err)
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "error",
      })
    }
  }

  const handleOpenEmailDialog = (booking: BookingSlot) => {
    setSelectedBookingForEmail(booking)
    setRecipientEmail("")
    setEmailStatus(null)
    setEmailDialogOpen(true)
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookingForEmail || !recipientEmail) return

    setSendingEmail(true)
    setEmailStatus(null)

    try {
      // Send email
      const result = await sendBookingEmail(selectedBookingForEmail, recipientEmail)

      if (result.success && result.messageId) {
        // Email sent successfully
        setEmailStatus({
          sent: true,
          verified: false,
          messageId: result.messageId,
        })

        toast({
          title: "Email Sent!",
          description: `Booking details sent to ${recipientEmail}`,
          variant: "success",
          duration: 5000,
        })

        // Verify delivery after a short delay
        setTimeout(async () => {
          try {
            const verification = await verifyEmailDelivery(result.messageId!)
            setEmailStatus((prev) =>
              prev
                ? {
                    ...prev,
                    verified: verification.delivered,
                  }
                : null,
            )

            if (verification.delivered) {
              toast({
                title: "Delivery Confirmed",
                description: "Email has been delivered successfully",
                variant: "success",
                duration: 3000,
              })
            }
          } catch (verifyError) {
            console.error("Email verification error:", verifyError)
          }
        }, 3000)

        // Close dialog after showing success
        setTimeout(() => {
          setEmailDialogOpen(false)
          setRecipientEmail("")
          setSelectedBookingForEmail(null)
          setEmailStatus(null)
        }, 2000)
      } else {
        // Email failed
        throw new Error(result.error || "Failed to send email")
      }
    } catch (err) {
      console.error("Error sending email:", err)
      setEmailStatus({
        sent: false,
        verified: false,
      })
      toast({
        title: "Email Failed",
        description: err instanceof Error ? err.message : "Failed to send email. Please try again.",
        variant: "error",
        duration: 7000,
      })
    } finally {
      setSendingEmail(false)
    }
  }

  // ---------------- UI ----------------
  return (
    <AppShell title="Parent Meetings">
      <ToastContainer>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={removeToast} />
        ))}
      </ToastContainer>

      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative p-8 md:p-12 text-white">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl shadow-lg animate-pulse">
                <Calendar className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Parent Meetings
                </h1>
                <p className="mt-3 text-xl text-white/90 max-w-2xl">
                  Schedule meaningful conversations about your child's development and progress
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span className="text-white/80">Easy online booking system with email confirmations</span>
                </div>
              </div>
            </div>
          </div>
          {/* Floating elements */}
          <div className="absolute top-4 right-4 animate-bounce">
            <Star className="h-6 w-6 text-yellow-300" />
          </div>
          <div className="absolute bottom-4 right-8 animate-pulse">
            <Heart className="h-5 w-5 text-pink-300" />
          </div>
        </div>

        <Section title="Meeting Booking System" description="Connect with teachers to discuss your child's journey">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enhanced Booking Form */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                    <Plus className="w-6 h-6" />
                  </div>
                  Book a Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Date & Time with enhanced styling */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="booking-date" className="text-sm font-semibold text-gray-700">
                      Preferred Date
                    </Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, date: e.target.value }))}
                      min={format(today, "yyyy-MM-dd")}
                      className="border-2 border-blue-100 focus:border-blue-400 rounded-xl transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-time" className="text-sm font-semibold text-gray-700">
                      Preferred Time
                    </Label>
                    <Select
                      value={bookingForm.time}
                      onValueChange={(value) => setBookingForm((prev) => ({ ...prev, time: value }))}
                    >
                      <SelectTrigger className="border-2 border-blue-100 focus:border-blue-400 rounded-xl">
                        {bookingForm.time || "Select time"}
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTimeSlots(bookingForm.date).map((t) => (
                          <SelectItem key={t} value={t} className="hover:bg-blue-50">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              {t}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Names with icons */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-name" className="text-sm font-semibold text-gray-700">
                      Parent Name
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="parent-name"
                        value={bookingForm.parentName}
                        onChange={(e) => setBookingForm((prev) => ({ ...prev, parentName: e.target.value }))}
                        placeholder="Your full name"
                        className="pl-10 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-name" className="text-sm font-semibold text-gray-700">
                      Child Name
                    </Label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <Input
                        id="child-name"
                        value={bookingForm.childName}
                        onChange={(e) => setBookingForm((prev) => ({ ...prev, childName: e.target.value }))}
                        placeholder="Your child's name"
                        className="pl-10 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration & Contact Method */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Duration</Label>
                    <Select
                      value={bookingForm.duration.toString()}
                      onValueChange={(v) => setBookingForm((prev) => ({ ...prev, duration: Number.parseInt(v) }))}
                    >
                      <SelectTrigger className="border-2 border-blue-100 focus:border-blue-400 rounded-xl">
                        {bookingForm.duration} minutes
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Meeting Type</Label>
                    <Select
                      value={bookingForm.contactMethod}
                      onValueChange={(v) => setBookingForm((prev) => ({ ...prev, contactMethod: v as any }))}
                    >
                      <SelectTrigger className="border-2 border-blue-100 focus:border-blue-400 rounded-xl">
                        <div className="flex items-center gap-2">
                          {bookingForm.contactMethod === "video" && <Video className="w-4 h-4 text-blue-500" />}
                          {bookingForm.contactMethod === "phone" && <Phone className="w-4 h-4 text-green-500" />}
                          {bookingForm.contactMethod === "in-person" && <Users className="w-4 h-4 text-purple-500" />}
                          <span>
                            {bookingForm.contactMethod === "in-person"
                              ? "In Person"
                              : bookingForm.contactMethod === "phone"
                                ? "Phone Call"
                                : "Video Call"}
                          </span>
                        </div>
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="in-person">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            In Person
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-500" />
                            Phone Call
                          </div>
                        </SelectItem>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-blue-500" />
                            Video Call
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Meeting Purpose</Label>
                  <Select
                    value={bookingForm.purpose}
                    onValueChange={(v) => setBookingForm((prev) => ({ ...prev, purpose: v }))}
                  >
                    <SelectTrigger className="border-2 border-blue-100 focus:border-blue-400 rounded-xl">
                      {meetingPurposes.find((p) => p.value === bookingForm.purpose)?.label || "Select meeting purpose"}
                    </SelectTrigger>
                    <SelectContent>
                      {meetingPurposes.map((p) => (
                        <SelectItem key={p.value} value={p.value} className="hover:bg-blue-50">
                          <div className="flex items-center gap-2">{p.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Additional Notes</Label>
                  <Textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Any specific topics you'd like to discuss..."
                    className="border-2 border-blue-100 focus:border-blue-400 rounded-xl resize-none"
                  />
                </div>

                <Button
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={handleSaveBooking}
                  disabled={!bookingForm.parentName || !bookingForm.childName || !bookingForm.date || !bookingForm.time}
                >
                  Request Meeting
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Upcoming Bookings */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white shadow-lg">
                    <Calendar className="w-6 h-6" />
                  </div>
                  Upcoming Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {loading ? (
                  <div className="text-center text-muted-foreground py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4">Loading bookings...</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {bookingSlots
                      .filter((b) => new Date(b.date) >= today)
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((booking) => {
                        const purposeData = meetingPurposes.find((p) => p.value === booking.purpose)
                        return (
                          <div
                            key={booking.id}
                            className="group relative overflow-hidden border-2 border-purple-100 rounded-2xl p-4 space-y-3 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                                  {booking.parentName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{booking.parentName}</div>
                                  <div className="text-sm text-gray-500">for {booking.childName}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    booking.status === "confirmed"
                                      ? "default"
                                      : booking.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className={cn(
                                    "shadow-sm",
                                    booking.status === "confirmed" && "bg-green-100 text-green-800 border-green-200",
                                    booking.status === "pending" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                                  )}
                                >
                                  {booking.status === "confirmed" && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {booking.status === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
                                  {booking.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                                  {booking.status}
                                </Badge>
                                <div className="p-1 rounded-lg bg-white/50">
                                  {booking.contactMethod === "video" && <Video className="w-4 h-4 text-blue-600" />}
                                  {booking.contactMethod === "phone" && <Phone className="w-4 h-4 text-green-600" />}
                                  {booking.contactMethod === "in-person" && (
                                    <Users className="w-4 h-4 text-purple-600" />
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="relative text-sm text-gray-600 space-y-2 bg-white/50 rounded-xl p-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                <span>
                                  {format(new Date(booking.date), "MMM d, yyyy")} at {booking.time}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>{booking.duration} minutes</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{purposeData?.label || booking.purpose}</span>
                              </div>
                              {booking.notes && (
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">💭</span>
                                  <span className="text-xs italic">{booking.notes}</span>
                                </div>
                              )}
                            </div>

                            <div className="relative flex gap-2 pt-2 flex-wrap">
                              {booking.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                                    className="bg-green-500 hover:bg-green-600 text-white shadow-sm"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Cancel
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEmailDialog(booking)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              >
                                <Mail className="w-3 h-3 mr-1" />
                                Email
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(booking.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto border-red-200"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    {bookingSlots.filter((b) => new Date(b.date) >= today).length === 0 && (
                      <div className="text-center text-gray-500 py-12">
                        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No upcoming bookings</p>
                        <p className="text-sm">Schedule your first meeting to get started!</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-4 text-3xl">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl">
                <Mail className="h-8 w-8 text-white" />
              </div>
              Send Booking Details
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600 mt-3">
              Send the booking details to the recipient via email with delivery confirmation
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendEmail}>
            <DialogBody className="space-y-6">
              {selectedBookingForEmail && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h4 className="font-bold text-lg text-gray-800 mb-4">Booking Summary</h4>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Parent:</strong> {selectedBookingForEmail.parentName}
                    </p>
                    <p>
                      <strong>Child:</strong> {selectedBookingForEmail.childName}
                    </p>
                    <p>
                      <strong>Date:</strong> {format(new Date(selectedBookingForEmail.date), "MMM d, yyyy")}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedBookingForEmail.time}
                    </p>
                    <p>
                      <strong>Duration:</strong> {selectedBookingForEmail.duration} minutes
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedBookingForEmail.contactMethod}
                    </p>
                    <p>
                      <strong>Purpose:</strong>{" "}
                      {meetingPurposes.find((p) => p.value === selectedBookingForEmail.purpose)?.label}
                    </p>
                    {selectedBookingForEmail.notes && (
                      <p>
                        <strong>Notes:</strong> {selectedBookingForEmail.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Email Status Indicator */}
              {emailStatus && (
                <div
                  className={cn(
                    "rounded-2xl p-4 border-2 flex items-center gap-3",
                    emailStatus.sent ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
                  )}
                >
                  {emailStatus.sent ? (
                    <>
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-800">Email Sent Successfully!</p>
                        {emailStatus.verified && <p className="text-sm text-green-700 mt-1">✓ Delivery confirmed</p>}
                        {!emailStatus.verified && emailStatus.messageId && (
                          <p className="text-sm text-green-700 mt-1">Verifying delivery...</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-red-800">Failed to Send Email</p>
                        <p className="text-sm text-red-700 mt-1">Please check the email address and try again</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="recipient-email" className="text-lg font-bold text-gray-700">
                  Recipient Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="recipient-email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    required
                    disabled={sendingEmail}
                    className="pl-12 h-14 border-2 border-blue-200 focus:border-blue-400 bg-white/90 backdrop-blur-sm text-base"
                  />
                </div>
              </div>
            </DialogBody>
            <DialogFooter className="pt-6 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
                disabled={sendingEmail}
                className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-3 text-base font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendingEmail || !recipientEmail}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3 text-base font-semibold disabled:opacity-50"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
