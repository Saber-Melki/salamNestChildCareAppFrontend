"use client"

import React, { useState, useEffect } from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Users, Phone, Video, Clock, CheckCircle, XCircle, Trash2, Calendar, Sparkles, Star, Heart, Plus } from "lucide-react"
import { format } from "../utils/date-utils"

import {
  BookingSlot,
  createBooking,
  deleteBooking,
  fetchBookings,
  updateBookingStatus,
} from "../services/bookingApi"
import { cn } from "../lib/utils"

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

  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([])
  const [loading, setLoading] = useState(false)
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
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Available time slots
  function getAvailableTimeSlots(date: string) {
    const bookedTimes = bookingSlots
      .filter((b) => b.date === date && b.status !== "cancelled")
      .map((b) => b.time)
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
    } catch (err) {
      console.error("Error creating booking:", err)
    }
  }

  // Update booking status
  async function handleStatusUpdate(id: string, status: "pending" | "confirmed" | "cancelled") {
    try {
      const updated = await updateBookingStatus(id, status)
      setBookingSlots((prev) => prev.map((b) => (b.id === id ? updated : b)))
    } catch (err) {
      console.error("Error updating booking:", err)
    }
  }

  // Delete booking
  async function handleDelete(id: string) {
    try {
      await deleteBooking(id)
      setBookingSlots((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      console.error("Error deleting booking:", err)
    }
  }

  // ---------------- UI ----------------
  return (
    <AppShell title="Parent Meetings">
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
                <p className="mt-3 text-xl text-white/90 max-w-2xxl">
                  Schedule meaningful conversations about your child's development and progress
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span className="text-white/80">Easy online booking system</span>
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
                          <div className="flex items-center gap-2">
                            {/* <span>{p.icon}</span> */}
                            {p.label}
                          </div>
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
                  <div className="space-y-4 max-h-96 overflow-y-hidden hover:overflow-y-auto pr-2">
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

                            <div className="relative flex gap-2 pt-2">
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
    </AppShell>
  )
}
