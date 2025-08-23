"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  BookOpen,
  Wrench,
  Star,
  CheckCircle,
  XCircle,
  Phone,
  Video,
} from "lucide-react"
import { addDays, endOfMonth, format, getDay, startOfMonth } from "../utils/date-utils"
import { cn } from "../lib/utils"

type EventType = "field-trip" | "closure" | "meeting" | "holiday" | "training" | "maintenance"

type Event = {
  id: string
  date: string
  title: string
  type: EventType
  description?: string
  time?: string
  location?: string
  attendees?: string[]
  allDay?: boolean
  recurring?: boolean
}

type BookingSlot = {
  id: string
  date: string
  time: string
  duration: number
  parentName: string
  childName: string
  purpose: string
  status: "pending" | "confirmed" | "cancelled"
  notes?: string
  contactMethod?: "in-person" | "phone" | "video"
}

const eventTypeConfig = {
  "field-trip": {
    label: "Field Trip",
    color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    icon: MapPin,
    description: "Educational outings and excursions",
  },
  closure: {
    label: "Center Closed",
    color: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    icon: AlertTriangle,
    description: "Days when the center is closed",
  },
  meeting: {
    label: "Meeting",
    color: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
    icon: Users,
    description: "Staff meetings and conferences",
  },
  holiday: {
    label: "Holiday",
    color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    icon: Star,
    description: "Public holidays and celebrations",
  },
  training: {
    label: "Staff Training",
    color: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
    icon: BookOpen,
    description: "Professional development sessions",
  },
  maintenance: {
    label: "Maintenance",
    color: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
    icon: Wrench,
    description: "Facility maintenance and repairs",
  },
}

const meetingPurposes = [
  { value: "progress-review", label: "Progress Review" },
  { value: "behavioral-concerns", label: "Behavioral Concerns" },
  { value: "academic-support", label: "Academic Support" },
  { value: "transition-planning", label: "Transition Planning" },
  { value: "general-discussion", label: "General Discussion" },
  { value: "enrollment", label: "Enrollment Discussion" },
  { value: "special-needs", label: "Special Needs Support" },
  { value: "other", label: "Other" },
]

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
]

export default function Calendar() {
  const today = new Date()
  const [month, setMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [events, setEvents] = React.useState<Event[]>([
    {
      id: "e1",
      date: format(addDays(startOfMonth(month), 3), "yyyy-MM-dd"),
      title: "Zoo Field Trip",
      type: "field-trip",
      description: "Educational visit to the city zoo with preschool group",
      time: "09:00",
      location: "City Zoo",
      attendees: ["Preschool Group"],
    },
    {
      id: "e2",
      date: format(addDays(startOfMonth(month), 10), "yyyy-MM-dd"),
      title: "Center Closed - Staff Training",
      type: "closure",
      description: "Mandatory staff development day - center closed to families",
      allDay: true,
    },
    {
      id: "e3",
      date: format(addDays(startOfMonth(month), 15), "yyyy-MM-dd"),
      title: "Parent-Teacher Conferences",
      type: "meeting",
      time: "14:00",
      location: "Conference Room",
      description: "Individual meetings with families to discuss child progress",
    },
  ])

  const [bookingSlots, setBookingSlots] = React.useState<BookingSlot[]>([
    {
      id: "b1",
      date: format(addDays(today, 2), "yyyy-MM-dd"),
      time: "09:00",
      duration: 30,
      parentName: "Sarah Johnson",
      childName: "Emma Johnson",
      purpose: "progress-review",
      status: "confirmed",
      notes: "Focus on reading development and social skills",
      contactMethod: "in-person",
    },
    {
      id: "b2",
      date: format(addDays(today, 5), "yyyy-MM-dd"),
      time: "15:30",
      duration: 30,
      parentName: "Mike Chen",
      childName: "Alex Chen",
      purpose: "behavioral-concerns",
      status: "pending",
      contactMethod: "video",
    },
    {
      id: "b3",
      date: format(addDays(today, 1), "yyyy-MM-dd"),
      time: "10:00",
      duration: 45,
      parentName: "Lisa Rodriguez",
      childName: "Sofia Rodriguez",
      purpose: "academic-support",
      status: "confirmed",
      notes: "Discuss math support strategies",
      contactMethod: "phone",
    },
  ])

  const [showEventDialog, setShowEventDialog] = React.useState(false)
  const [showEventDetails, setShowEventDetails] = React.useState<Event | null>(null)
  const [showBookingDialog, setShowBookingDialog] = React.useState(false)
  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = React.useState<string>("")
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | null>(null)

  const [eventForm, setEventForm] = React.useState({
    title: "",
    type: "meeting" as EventType,
    description: "",
    time: "",
    location: "",
    allDay: false,
    recurring: false,
  })

  const [bookingForm, setBookingForm] = React.useState({
    date: "",
    time: "",
    duration: 30,
    parentName: "",
    childName: "",
    purpose: "",
    notes: "",
    contactMethod: "in-person" as "in-person" | "phone" | "video",
  })

  const first = startOfMonth(month)
  const last = endOfMonth(month)
  const prefix = getDay(first)
  const days = last.getDate() + prefix
  const weeks = Math.ceil(days / 7)

  const filteredEvents = React.useMemo(() => {
    const monthStr = format(month, "yyyy-MM")
    return events.filter((e) => e.date.startsWith(monthStr))
  }, [events, month])

  const isSameDay = (a: Date, iso: string) => format(a, "yyyy-MM-dd") === iso

  const openEventDialog = (type?: EventType, date?: string) => {
    setSelectedDate(date || "")
    setSelectedEventType(type || null)
    setEventForm({
      title: "",
      type: type || "meeting",
      description: "",
      time: "",
      location: "",
      allDay: false,
      recurring: false,
    })
    setEditingEvent(null)
    setShowEventDialog(true)
  }

  const editEvent = (event: Event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      type: event.type,
      description: event.description || "",
      time: event.time || "",
      location: event.location || "",
      allDay: event.allDay || false,
      recurring: event.recurring || false,
    })
    setSelectedDate(event.date)
    setShowEventDialog(true)
  }

  const saveEvent = () => {
    if (!eventForm.title.trim() || !selectedDate) return

    const newEvent: Event = {
      id: editingEvent?.id || crypto.randomUUID(),
      date: selectedDate,
      title: eventForm.title,
      type: eventForm.type,
      description: eventForm.description,
      time: eventForm.allDay ? undefined : eventForm.time,
      location: eventForm.location,
      allDay: eventForm.allDay,
      recurring: eventForm.recurring,
    }

    if (editingEvent) {
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? newEvent : e)))
    } else {
      setEvents((prev) => [...prev, newEvent])
    }

    setShowEventDialog(false)
  }

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
    setShowEventDetails(null)
  }

  const saveBooking = () => {
    if (!bookingForm.parentName.trim() || !bookingForm.childName.trim() || !bookingForm.date || !bookingForm.time)
      return

    const newBooking: BookingSlot = {
      id: crypto.randomUUID(),
      date: bookingForm.date,
      time: bookingForm.time,
      duration: bookingForm.duration,
      parentName: bookingForm.parentName,
      childName: bookingForm.childName,
      purpose: bookingForm.purpose,
      status: "pending",
      notes: bookingForm.notes,
      contactMethod: bookingForm.contactMethod,
    }

    setBookingSlots((prev) => [...prev, newBooking])
    setBookingForm({
      date: "",
      time: "",
      duration: 30,
      parentName: "",
      childName: "",
      purpose: "",
      notes: "",
      contactMethod: "in-person",
    })
    setShowBookingDialog(false)
  }

  const updateBookingStatus = (bookingId: string, status: "confirmed" | "cancelled") => {
    setBookingSlots((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)))
  }

  const deleteBooking = (bookingId: string) => {
    setBookingSlots((prev) => prev.filter((b) => b.id !== bookingId))
  }

  const getAvailableTimeSlots = (selectedDate: string) => {
    const bookedTimes = bookingSlots
      .filter((b) => b.date === selectedDate && b.status !== "cancelled")
      .map((b) => b.time)
    return timeSlots.filter((time) => !bookedTimes.includes(time))
  }

  return (
    <AppShell title="Calendar & Scheduling">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-emerald-600" />
              Calendar & Scheduling
            </h1>
            <p className="text-muted-foreground mt-2">Events, closures, field trips, and parent bookings.</p>
          </div>
        </div>

        {/* Quick Add Event Boxes */}
        <Section title="Quick Add Events" description="Create events quickly with predefined templates.">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(eventTypeConfig).map(([type, config]) => {
              const Icon = config.icon
              return (
                <Card
                  key={type}
                  className={cn(
                    "cursor-pointer transition-all duration-200 border-2 hover:shadow-lg hover:scale-105",
                    config.color,
                  )}
                  onClick={() => openEventDialog(type as EventType)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{config.label}</h3>
                    <p className="text-xs opacity-80 leading-tight">{config.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Section>

        <Section title="Event Calendar" description="Manage all center events and activities.">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Button variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              Previous
            </Button>
            <div className="font-semibold text-lg">{format(month, "MMMM yyyy")}</div>
            <Button variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              Next
            </Button>
            <Button variant="outline" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>
              Today
            </Button>
            <div className="ml-auto flex gap-2 flex-wrap">
              <Button onClick={() => openEventDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Custom Event
              </Button>
              <Button size="sm" variant="outline">
                Sync Google
              </Button>
              <Button size="sm" variant="outline">
                Sync Outlook
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
              <div key={d} className="text-center font-medium text-sm p-2 bg-muted/30 rounded-t-md">
                {d}
              </div>
            ))}

            {Array.from({ length: prefix }).map((_, i) => (
              <div key={`p-${i}`} className="min-h-24 border rounded-md bg-muted/10" />
            ))}

            {Array.from({ length: last.getDate() }).map((_, i) => {
              const date = new Date(month.getFullYear(), month.getMonth(), i + 1)
              const iso = format(date, "yyyy-MM-dd")
              const dayEvents = filteredEvents.filter((e) => isSameDay(date, e.date))
              const dayBookings = bookingSlots.filter((b) => b.date === iso)
              const isToday = format(today, "yyyy-MM-dd") === iso

              return (
                <div
                  key={iso}
                  className={cn(
                    "border rounded-md p-2 min-h-24 cursor-pointer hover:bg-accent/50 transition-colors",
                    isToday ? "ring-2 ring-primary bg-primary/5" : "",
                  )}
                  onClick={() => openEventDialog(undefined, iso)}
                >
                  <div className={cn("text-sm font-medium mb-1", isToday ? "text-primary font-bold" : "")}>{i + 1}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((e) => {
                      const config = eventTypeConfig[e.type]
                      const Icon = config.icon
                      return (
                        <div
                          key={e.id}
                          className={cn(
                            "text-[10px] rounded px-1 py-0.5 cursor-pointer hover:opacity-80 flex items-center gap-1",
                            config.color.replace("hover:bg-", "bg-"),
                          )}
                          onClick={(ev) => {
                            ev.stopPropagation()
                            setShowEventDetails(e)
                          }}
                        >
                          <Icon className="w-2 h-2" />
                          <span className="truncate">{e.title}</span>
                        </div>
                      )
                    })}
                    {dayBookings.slice(0, 1).map((b) => (
                      <div
                        key={b.id}
                        className="text-[10px] rounded px-1 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"
                      >
                        <Users className="w-2 h-2" />
                        <span className="truncate">
                          {b.time} - {b.parentName}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length + dayBookings.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayEvents.length + dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {Array.from({ length: weeks * 7 - days }).map((_, i) => (
              <div key={`s-${i}`} className="min-h-24 border rounded-md bg-muted/10" />
            ))}
          </div>
        </Section>

        {/* Parent Booking System */}
        <Section title="Parent Meeting Bookings" description="Online booking system for parent-teacher conferences.">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Book a Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="booking-date">Preferred Date</Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, date: e.target.value }))}
                      min={format(today, "yyyy-MM-dd")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="booking-time">Preferred Time</Label>
                    <Select
                      value={bookingForm.time}
                      onValueChange={(value) => setBookingForm((prev) => ({ ...prev, time: value }))}
                    >
                      <SelectTrigger>
                        <span>{bookingForm.time}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTimeSlots(bookingForm.date).map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parent-name">Parent Name</Label>
                    <Input
                      id="parent-name"
                      value={bookingForm.parentName}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, parentName: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="child-name">Child Name</Label>
                    <Input
                      id="child-name"
                      value={bookingForm.childName}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, childName: e.target.value }))}
                      placeholder="Your child's name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meeting-duration">Duration</Label>
                    <Select
                      value={bookingForm.duration.toString()}
                      onValueChange={(value) =>
                        setBookingForm((prev) => ({ ...prev, duration: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <span>{bookingForm.duration} minutes</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contact-method">Meeting Type</Label>
                    <Select
                      value={bookingForm.contactMethod}
                      onValueChange={(value) => setBookingForm((prev) => ({ ...prev, contactMethod: value as any }))}
                    >
                      <SelectTrigger>
                        <span className="flex items-center gap-2">
                          {bookingForm.contactMethod === "video" && <Video className="w-4 h-4" />}
                          {bookingForm.contactMethod === "phone" && <Phone className="w-4 h-4" />}
                          {bookingForm.contactMethod === "in-person" && <Users className="w-4 h-4" />}
                          {bookingForm.contactMethod === "in-person"
                            ? "In Person"
                            : bookingForm.contactMethod === "phone"
                              ? "Phone Call"
                              : "Video Call"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            In Person
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone Call
                          </div>
                        </SelectItem>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video Call
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="meeting-purpose">Meeting Purpose</Label>
                  <Select
                    value={bookingForm.purpose}
                    onValueChange={(value) => setBookingForm((prev) => ({ ...prev, purpose: value }))}
                  >
                    <SelectTrigger>
                      <span>
                        {meetingPurposes.find((p) => p.value === bookingForm.purpose)?.label ||
                          "Select meeting purpose"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {meetingPurposes.map((purpose) => (
                        <SelectItem key={purpose.value} value={purpose.value}>
                          {purpose.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="booking-notes">Additional Notes</Label>
                  <Textarea
                    id="booking-notes"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any specific topics you'd like to discuss..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={saveBooking}
                  className="w-full"
                  disabled={!bookingForm.parentName || !bookingForm.childName || !bookingForm.date || !bookingForm.time}
                >
                  Request Meeting
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-98 overflow-y-auto">
                  {bookingSlots
                    .filter((b) => new Date(b.date) >= today)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((booking) => {
                      const purposeLabel =
                        meetingPurposes.find((p) => p.value === booking.purpose)?.label || booking.purpose
                      return (
                        <div key={booking.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{booking.parentName}</div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  booking.status === "confirmed"
                                    ? "default"
                                    : booking.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {booking.status === "confirmed" && <CheckCircle className="w-3 h-3 mr-1" />}
                                {booking.status === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
                                {booking.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                                {booking.status}
                              </Badge>
                              {booking.contactMethod === "video" && <Video className="w-4 h-4 text-blue-600" />}
                              {booking.contactMethod === "phone" && <Phone className="w-4 h-4 text-green-600" />}
                              {booking.contactMethod === "in-person" && <Users className="w-4 h-4 text-purple-600" />}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Child: {booking.childName}</div>
                            <div>
                              Date: {format(new Date(booking.date), "MMM d, yyyy")} at {booking.time}
                            </div>
                            <div>Duration: {booking.duration} minutes</div>
                            <div>Purpose: {purposeLabel}</div>
                            {booking.notes && <div>Notes: {booking.notes}</div>}
                          </div>
                          <div className="flex gap-2 pt-2">
                            {booking.status === "pending" && (
                              <>
                                <Button size="sm" onClick={() => updateBookingStatus(booking.id, "confirmed")}>
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateBookingStatus(booking.id, "cancelled")}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBooking(booking.id)}
                              className="text-red-600 hover:text-red-700 ml-auto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  {bookingSlots.filter((b) => new Date(b.date) >= today).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No upcoming bookings</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Add/Edit Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEvent
                  ? "Edit Event"
                  : selectedEventType
                    ? `Create ${eventTypeConfig[selectedEventType].label}`
                    : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select
                      value={eventForm.type}
                      onValueChange={(value) => setEventForm((prev) => ({ ...prev, type: value as EventType }))}
                    >
                      <SelectTrigger>
                        <span>{eventTypeConfig[eventForm.type].label}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(eventTypeConfig).map(([type, config]) => (
                          <SelectItem key={type} value={type}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="event-date">Date</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={eventForm.allDay}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, allDay: e.target.checked }))}
                    />
                    All Day Event
                  </label>
                </div>

                {!eventForm.allDay && (
                  <div>
                    <Label htmlFor="event-time">Time</Label>
                    <Input
                      id="event-time"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                  />
                </div>

                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Event details and notes"
                    rows={3}
                  />
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveEvent} disabled={!eventForm.title.trim() || !selectedDate}>
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Event Details Dialog */}
        {showEventDetails && (
          <Dialog open={!!showEventDetails} onOpenChange={() => setShowEventDetails(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle>{showEventDetails.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={eventTypeConfig[showEventDetails.type].color.replace("hover:bg-", "bg-")}>
                        {eventTypeConfig[showEventDetails.type].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => editEvent(showEventDetails)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEvent(showEventDetails.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <DialogBody>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span>{format(new Date(showEventDetails.date), "EEEE, MMMM d, yyyy")}</span>
                  </div>

                  {showEventDetails.time && !showEventDetails.allDay && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{showEventDetails.time}</span>
                    </div>
                  )}

                  {showEventDetails.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{showEventDetails.location}</span>
                    </div>
                  )}

                  {showEventDetails.description && (
                    <div className="text-sm">
                      <div className="font-medium mb-1">Description:</div>
                      <p className="text-muted-foreground">{showEventDetails.description}</p>
                    </div>
                  )}
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEventDetails(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppShell>
  )
}