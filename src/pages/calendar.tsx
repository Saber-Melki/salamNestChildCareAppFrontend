"use client";

import { useEffect, useState } from "react";
import { AppShell, Section } from "../components/app-shell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Added DialogDescription
  DialogBody,
  DialogFooter,
} from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"; // Added SelectValue
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"; // Added CardHeader, CardTitle, CardDescription
import { Badge } from "../components/ui/badge";
import {
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Star,
  BookOpen,
  Wrench,
  AlertTriangle,
  Clock,
  ArrowLeft, // Added ArrowLeft
  ArrowRight,
  Users,
  Sparkles,
  Sun,
  Moon,
  Zap, // Added ArrowRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth, addDays, getDay } from "../utils/date-utils"; // Assuming these are robust
import { cn } from "../lib/utils";
import { Checkbox } from "../components/ui/checkbox";

// ---------------- Event Types
export type EventType = "field-trip" | "closure" | "holiday" | "training" | "maintenance";
export type Event = {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  type: EventType;
  description?: string;
  time?: string; // HH:MM format
  location?: string;
  allDay?: boolean;
  recurring?: boolean; // Added for future recurring events feature
};

// ---------------- API functions via gateway
async function fetchEvents(): Promise<Event[]> {
  try {
    const res = await fetch("http://localhost:8080/calendar/events");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return []; // Return empty array on error
  }
}

async function createEvent(event: Omit<Event, "id">): Promise<Event> {
  try {
    const res = await fetch("http://localhost:8080/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to create event:", error);
    throw error; // Re-throw to be handled by the caller
  }
}

async function updateEvent(event: Event): Promise<Event> {
  try {
    const res = await fetch(`http://localhost:8080/calendar/events/${event.id}`, {
      method: "PUT", // Use PUT for updates
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to update event:", error);
    throw error;
  }
}

async function deleteEvent(id: string) {
  try {
    const res = await fetch(`http://localhost:8080/calendar/events/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  } catch (error) {
    console.error("Failed to delete event:", error);
    throw error;
  }
}

// ---------------- Event Type Config
const eventTypeConfig = {
  "field-trip": { label: "Field Trip", color: "bg-blue-100 text-blue-800 border-blue-200 icon-blue-800", icon: MapPin, description: "Educational outings" },
  closure: { label: "Center Closed", color: "bg-red-100 text-red-800 border-red-200 icon-red-800", icon: AlertTriangle, description: "Days when center is closed" },
  holiday: { label: "Holiday", color: "bg-green-100 text-green-800 border-green-200 icon-green-800", icon: Star, description: "Public holidays" },
  training: { label: "Staff Training", color: "bg-orange-100 text-orange-800 border-orange-200 icon-orange-800", icon: BookOpen, description: "Professional development" },
  maintenance: { label: "Maintenance", color: "bg-gray-100 text-gray-800 border-gray-200 icon-gray-800", icon: Wrench, description: "Facility maintenance" },
  meeting: { label: "Meeting", color: "bg-purple-100 text-purple-800 border-purple-200 icon-purple-800", icon: Users, description: "Team meetings" },
};


// ---------------- React Component
export default function Calendar() {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Unified form state
  const [eventForm, setEventForm] = useState({
    date: format(today, "yyyy-MM-dd"), // Initialize with today's date
    title: "",
    type: "training" as EventType,
    description: "",
    time: "09:00", // Default time
    location: "",
    allDay: false,
    recurring: false,
  });

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []); // Fetch events only once on component mount

  // Calendar grid calculations
  const firstDayOfMonth = startOfMonth(month);
  const lastDayOfMonth = endOfMonth(month);
  const startingDayOfWeek = getDay(firstDayOfMonth); // 0 for Sunday, 6 for Saturday
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const daysInCalendar = startingDayOfWeek + totalDaysInMonth;
  const numWeeks = Math.ceil(daysInCalendar / 7);

  const filteredEvents = events.filter((e) => e.date.startsWith(format(month, "yyyy-MM")));

  const isSameDay = (date1: Date, isoDateString2: string) => format(date1, "yyyy-MM-dd") === isoDateString2;

  const resetEventForm = (type: EventType = "training", date: string = format(today, "yyyy-MM-dd")) => {
    setEventForm({
      date: date,
      title: "",
      type: type,
      description: "",
      time: "09:00",
      location: "",
      allDay: false,
      recurring: false,
    });
  };

  const openEventDialog = (type?: EventType, date?: string) => {
    resetEventForm(type, date);
    setEditingEvent(null);
    setShowEventDialog(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      date: event.date,
      title: event.title,
      type: event.type,
      description: event.description || "",
      time: event.time || "09:00",
      location: event.location || "",
      allDay: event.allDay || false,
      recurring: event.recurring || false,
    });
    setShowEventDialog(true);
  };

  const saveEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.date) return;

    const eventToSave: Omit<Event, "id"> = {
      ...eventForm,
      time: eventForm.allDay ? undefined : eventForm.time, // Clear time if all-day
    };

    try {
      let savedEvent: Event;
      if (editingEvent) {
        savedEvent = await updateEvent({ ...eventToSave, id: editingEvent.id });
        setEvents((prev) => prev.map((e) => (e.id === savedEvent.id ? savedEvent : e)));
      } else {
        savedEvent = await createEvent(eventToSave);
        setEvents((prev) => [...prev, savedEvent]);
      }
      setShowEventDialog(false);
      setShowEventDetails(null); // Close details if open and editing
    } catch (error) {
      // Handle error, e.g., show a toast notification
      console.error("Error saving event:", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setShowEventDetails(null); // Close details after deleting
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const navigateMonth = (direction: -1 | 1) => {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return (
    <AppShell title="Calendar & Scheduling">
      <div className="space-y-8">
        {/* Enhanced Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative p-8 md:p-12 text-white">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                <CalendarDays className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  Calendar & Scheduling
                </h1>
                <p className="mt-3 text-xl text-white/90 max-w-2xl">
                  Organize events, closures, field trips, and important dates
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <span className="text-white/80">Smart scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-300" />
                    <span className="text-white/80">Quick templates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating decorative elements */}
          <div className="absolute top-6 right-6">
            <Sun className="h-6 w-6 text-yellow-300" />
          </div>
          <div className="absolute bottom-6 right-12">
            <Moon className="h-5 w-5 text-blue-200" />
          </div>
        </div>

        {/* Quick Add Event Boxes */}
        <Section title="Quick Add Events" description="Create events quickly with beautiful templates">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(eventTypeConfig).map(([type, config]) => {
              const Icon = config.icon
              return (
                <Card
                  key={type}
                  className={cn(
                    "group cursor-pointer transition-all duration-300 border-2 hover:shadow-2xl hover:scale-105 relative overflow-hidden",
                    config.color,
                  )}
                  onClick={() => openEventDialog(type as EventType)}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                    )}
                  />
                  <CardContent className="p-6 text-center relative">
                    <div className="mb-4 relative">
                      <div
                        className={cn(
                          "w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300",
                          config.color,)}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-sm mb-2 group-hover:scale-105 transition-transform duration-200">
                      {config.label}
                    </h3>
                    <p className="text-xs opacity-80 leading-tight">{config.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Section>

        <Section title="Event Calendar" description="Manage all center events and activities">
          {/* Enhanced Calendar Controls */}
          <div className="flex items-center gap-4 mb-6 flex-wrap bg-white/50 backdrop-blur-sm rounded-2xl p-4 border shadow-sm">
            <Button
              variant="outline"
              onClick={() => navigateMonth(-1)}
              className="hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <div className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {format(month, "MMMM yyyy")}
            </div>
            <Button
              variant="outline"
              onClick={() => navigateMonth(1)}
              className="hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="hover:bg-green-50 border-green-200 hover:border-green-300"
            >
              <Sun className="w-4 h-4 mr-2" />
              Today
            </Button>
            <div className="ml-auto flex gap-3 flex-wrap">
              <Button
                onClick={() => openEventDialog()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Custom Event
              </Button>
              <Button size="sm" variant="outline" className="hover:bg-blue-50 bg-transparent">
                Sync Google
              </Button>
              <Button size="sm" variant="outline" className="hover:bg-green-50 bg-transparent">
                Sync Outlook
              </Button>
            </div>
          </div>

          {/* Enhanced Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 bg-white rounded-2xl p-4 shadow-lg border">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
              <div
                key={d}
                className="text-center font-bold text-sm p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-700"
              >
                {d}
              </div>
            ))}

            {/* Empty cells for days before the 1st of the month */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div
                key={`prefix-${i}`}
                className="min-h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50"
              />
            ))}

            {/* Days of the month */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const date = new Date(month.getFullYear(), month.getMonth(), i + 1)
              const iso = format(date, "yyyy-MM-dd")
              const dayEvents = filteredEvents.filter((e) => isSameDay(date, e.date))
              const isToday = format(today, "yyyy-MM-dd") === iso

              return (
                <div
                  key={iso}
                  className={cn(
                    "border-2 rounded-xl p-3 min-h-32 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-white",
                    isToday
                      ? "ring-4 ring-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300"
                      : "border-gray-200 hover:border-indigo-300",
                  )}
                  onClick={() => openEventDialog(undefined, iso)}
                >
                  <div
                    className={cn(
                      "text-sm font-bold mb-2 flex items-center justify-center w-8 h-8 rounded-full",
                      isToday ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" : "text-gray-700",
                    )}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-grow space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((e) => {
                      const config = eventTypeConfig[e.type]
                      const Icon = config.icon
                      return (
                        <Badge
                          key={e.id}
                          className={cn(
                            "text-[10px] rounded-lg px-2 py-1 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-1 w-full justify-start",
                            config.color,
                          )}
                          onClick={(ev) => {
                            ev.stopPropagation()
                            setShowEventDetails(e)
                          }}
                        >
                          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate font-medium">{e.title}</span>
                          {e.time && !e.allDay && (
                            <span className="ml-auto text-[9px] opacity-80 flex-shrink-0 bg-white/30 px-1 rounded">
                              {e.time}
                            </span>
                          )}
                        </Badge>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div
                        className="text-[10px] text-indigo-600 font-medium cursor-pointer hover:text-indigo-800 bg-indigo-50 rounded px-2 py-1 text-center transition-colors duration-200"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          alert(`All events for ${iso}:\n` + dayEvents.map((e) => `• ${e.title}`).join("\n"))
                        }}
                      >
                        +{dayEvents.length - 3} more events
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Empty cells for days after the last of the month */}
            {Array.from({ length: numWeeks * 7 - daysInCalendar }).map((_, i) => (
              <div
                key={`suffix-${i}`}
                className="min-h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50"
              />
            ))}
          </div>
        </Section>

        {/* Enhanced Add/Edit Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-white to-indigo-50/50 border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {editingEvent
                  ? "Edit Event"
                  : eventForm.type
                    ? `Create ${eventTypeConfig[eventForm.type].label}`
                    : "Create New Event"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingEvent ? "Update the details of your event." : "Fill in the details for your new event."}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="event-title" className="text-sm font-semibold text-gray-700">
                    Event Title
                  </Label>
                  <Input
                    id="event-title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                    className="border-2 border-indigo-100 focus:border-indigo-400 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-type" className="text-sm font-semibold text-gray-700">
                      Event Type
                    </Label>
                    <Select
                      value={eventForm.type}
                      onValueChange={(value) => setEventForm((prev) => ({ ...prev, type: value as EventType }))}
                    >
                      <SelectTrigger className="border-2 border-indigo-100 focus:border-indigo-400 rounded-xl">
                        <SelectValue placeholder="Select event type">
                          {eventTypeConfig[eventForm.type].label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(eventTypeConfig).map(([type, config]) => {
                          const Icon = config.icon
                          return (
                            <SelectItem key={type} value={type} className="hover:bg-indigo-50">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-date" className="text-sm font-semibold text-gray-700">
                      Date
                    </Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="border-2 border-indigo-100 focus:border-indigo-400 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-indigo-50 p-3 rounded-xl">
                  <Checkbox
                    id="all-day-event"
                    checked={eventForm.allDay}
                    onCheckedChange={(checked) => setEventForm((prev) => ({ ...prev, allDay: checked as boolean }))}
                  />
                  <label htmlFor="all-day-event" className="text-sm font-medium text-gray-700 cursor-pointer">
                    All Day Event
                  </label>
                </div>

                {!eventForm.allDay && (
                  <div className="space-y-2">
                    <Label htmlFor="event-time" className="text-sm font-semibold text-gray-700">
                      Time
                    </Label>
                    <Input
                      id="event-time"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, time: e.target.value }))}
                      className="border-2 border-indigo-100 focus:border-indigo-400 rounded-xl"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="event-location" className="text-sm font-semibold text-gray-700">
                    Location
                  </Label>
                  <Input
                    id="event-location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                    className="border-2 border-indigo-100 focus:border-indigo-400 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-description" className="text-sm font-semibold text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="event-description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Event details and notes"
                    rows={3}
                    className="border-2 border-indigo-100 focus:border-indigo-400 rounded-xl resize-none"
                  />
                </div>
              </div>
            </DialogBody>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEventDialog(false)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={saveEvent}
                disabled={!eventForm.title.trim() || !eventForm.date}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced Event Details Dialog */}
        {showEventDetails && (
          <Dialog open={!!showEventDetails} onOpenChange={() => setShowEventDetails(null)}>
            <DialogContent className="max-w-lg bg-gradient-to-br from-white to-purple-50/50 border-0 shadow-2xl">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">{showEventDetails.title}</DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                      Event details for {format(new Date(showEventDetails.date), "MMMM d, yyyy")}
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className={cn(eventTypeConfig[showEventDetails.type].color, "shadow-sm font-medium")}>
                        {eventTypeConfig[showEventDetails.type].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditEvent(showEventDetails)}
                      className="hover:bg-blue-50 border-blue-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteEvent(showEventDetails.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <DialogBody>
                <div className="space-y-4 bg-white/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarDays className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium">{format(new Date(showEventDetails.date), "EEEE, MMMM d, yyyy")}</span>
                  </div>

                  {showEventDetails.time && !showEventDetails.allDay && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">{showEventDetails.time}</span>
                    </div>
                  )}

                  {showEventDetails.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{showEventDetails.location}</span>
                    </div>
                  )}

                  {showEventDetails.description && (
                    <div className="text-sm">
                      <div className="font-semibold mb-2 text-gray-700">Description:</div>
                      <p className="text-gray-600 bg-gray-50 rounded-lg p-3">{showEventDetails.description}</p>
                    </div>
                  )}
                </div>
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEventDetails(null)}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppShell>
  );
}