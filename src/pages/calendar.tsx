"use client"

import { AppShell, Section } from "../components/app-shell"
import { Require } from "../contexts/rbac"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Dialog } from "../components/ui/dialog"
import { Select } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { CalendarDays, Plus, Edit, Trash2, Clock, MapPin, Users, AlertTriangle } from "lucide-react"
import { useMemo, useState } from "react"
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

const eventTypeConfig = {
  "field-trip": {
    label: "Field Trip",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    icon: MapPin,
  },
  closure: {
    label: "Center Closed",
    color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    icon: AlertTriangle,
  },
  meeting: {
    label: "Meeting",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    icon: Users,
  },
  holiday: {
    label: "Holiday",
    color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    icon: CalendarDays,
  },
  training: {
    label: "Staff Training",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    icon: Users,
  },
  maintenance: {
    label: "Maintenance",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300",
    icon: Clock,
  },
}

export default function Calendar() {
  const today = new Date()
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [events, setEvents] = useState<Event[]>([
    {
      id: "e1",
      date: format(addDays(startOfMonth(month), 3), "yyyy-MM-dd"),
      title: "Zoo Field Trip",
      type: "field-trip",
      description: "Educational visit to the city zoo",
      time: "09:00",
      location: "City Zoo",
      attendees: ["Preschool Group"],
    },
    {
      id: "e2",
      date: format(addDays(startOfMonth(month), 10), "yyyy-MM-dd"),
      title: "Center Closed - Staff Training",
      type: "closure",
      description: "Mandatory staff development day",
      allDay: true,
    },
    {
      id: "e3",
      date: format(addDays(startOfMonth(month), 15), "yyyy-MM-dd"),
      title: "Parent-Teacher Conferences",
      type: "meeting",
      time: "14:00",
      location: "Conference Room",
      description: "Individual meetings with families",
    },
  ])

  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [eventForm, setEventForm] = useState({
    title: "",
    type: "meeting" as EventType,
    description: "",
    time: "",
    location: "",
    allDay: false,
    recurring: false,
  })

  const first = startOfMonth(month)
  const last = endOfMonth(month)
  const prefix = getDay(first)
  const days = last.getDate() + prefix
  const weeks = Math.ceil(days / 7)

  const filteredEvents = useMemo(() => {
    const monthStr = format(month, "yyyy-MM")
    return events.filter((e) => e.date.startsWith(monthStr))
  }, [events, month])

  const isSameDay = (a: Date, iso: string) => format(a, "yyyy-MM-dd") === iso

  const openEventDialog = (date?: string) => {
    setSelectedDate(date || "")
    setEventForm({
      title: "",
      type: "meeting",
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

  return (
    <AppShell>
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

        <Require permission="manage:calendar">
          <div className="space-y-6">
            <Section title="Event Calendar" description="Manage all center events and activities.">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                >
                  Previous
                </Button>
                <div className="font-semibold text-lg">{format(month, "MMMM yyyy")}</div>
                <Button
                  variant="outline"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                >
                  Next
                </Button>
                <Button variant="outline" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>
                  Today
                </Button>
                <div className="ml-auto flex gap-2">
                  <Button onClick={() => openEventDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                  <Button size="sm" variant="outline">
                    Sync Google
                  </Button>
                  <Button size="sm" variant="outline">
                    Sync Outlook
                  </Button>
                </div>
              </div>

              {/* Event Type Legend */}
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                {Object.entries(eventTypeConfig).map(([type, config]) => {
                  const Icon = config.icon
                  return (
                    <div key={type} className="flex items-center gap-1 text-xs">
                      <Icon className="w-3 h-3" />
                      <span className={cn("px-2 py-1 rounded-full", config.color)}>{config.label}</span>
                    </div>
                  )
                })}
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
                  const isToday = format(today, "yyyy-MM-dd") === iso

                  return (
                    <div
                      key={iso}
                      className={cn(
                        "border rounded-md p-2 min-h-24 cursor-pointer hover:bg-accent/50 transition-colors",
                        isToday ? "ring-2 ring-primary bg-primary/5" : "",
                      )}
                      onClick={() => openEventDialog(iso)}
                    >
                      <div className={cn("text-sm font-medium mb-1", isToday ? "text-primary font-bold" : "")}>
                        {i + 1}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((e) => {
                          const config = eventTypeConfig[e.type]
                          const Icon = config.icon
                          return (
                            <div
                              key={e.id}
                              className={cn(
                                "text-[10px] rounded px-1 py-0.5 cursor-pointer hover:opacity-80 flex items-center gap-1",
                                config.color,
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
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</div>
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

            {/* Upcoming Events */}
            <Section title="Upcoming Events" description="Next 7 days overview">
              <div className="space-y-2">
                {events
                  .filter((e) => {
                    const eventDate = new Date(e.date)
                    const weekFromNow = addDays(today, 7)
                    return eventDate >= today && eventDate <= weekFromNow
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event) => {
                    const config = eventTypeConfig[event.type]
                    const Icon = config.icon
                    return (
                      <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(event.date), "MMM d, yyyy")}
                            {event.time && !event.allDay && ` at ${event.time}`}
                            {event.location && ` • ${event.location}`}
                          </div>
                        </div>
                        <span className={cn("px-2 py-1 rounded-full text-xs", config.color)}>{config.label}</span>
                        <Button variant="ghost" size="sm" onClick={() => setShowEventDetails(event)}>
                          View
                        </Button>
                      </div>
                    )
                  })}
              </div>
            </Section>
          </div>

          {/* Add/Edit Event Dialog */}
          <Dialog open={showEventDialog}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{editingEvent ? "Edit Event" : "Create New Event"}</h3>

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
                      {Object.entries(eventTypeConfig).map(([type, config]) => (
                        <option key={type} value={type}>
                          {config.label}
                        </option>
                      ))}
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

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEvent}>{editingEvent ? "Update Event" : "Create Event"}</Button>
              </div>
            </div>
          </Dialog>

          {/* Event Details Dialog */}
          {showEventDetails && (
            <Dialog open={!!showEventDetails}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{showEventDetails.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn("px-2 py-1 rounded-full text-xs", eventTypeConfig[showEventDetails.type].color)}
                      >
                        {eventTypeConfig[showEventDetails.type].label}
                      </span>
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

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowEventDetails(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </Dialog>
          )}
        </Require>
      </div>
    </AppShell>
  )
}
