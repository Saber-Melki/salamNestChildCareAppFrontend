export type EventType = "field-trip" | "closure" | "meeting" | "holiday" | "training" | "maintenance";

export type Event = {
  id: string;
  date: string;
  title: string;
  type: EventType;
  description?: string;
  time?: string;
  location?: string;
  attendees?: string[];
  allDay?: boolean;
  recurring?: boolean;
};

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch("http://localhost:8080/calendar/events"); // gateway endpoint
  return res.json();
}

export async function createEvent(event: Omit<Event, "id">): Promise<Event> {
  const res = await fetch("http://localhost:8080/calendar/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  return res.json();
}

export async function deleteEvent(id: string) {
  await fetch(`http://localhost:8080/calendar/events/${id}`, { method: "DELETE" });
}
