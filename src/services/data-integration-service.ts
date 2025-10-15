interface QueryIntent {
  entity: "children" | "attendance" | "billing" | "health" | "media" | "report" | "shift" | "booking" | "event" | "album" | "staff" | "user"
  type: "list" | "analyze" | "generate"
  filters?: Record<string, any>
  timeframe?: string
  aggregation?: string
}

interface DataResult {
  data: any
  count?: number
  metadata: {
    source: string
    timestamp: string
  }
}

const API_BASE_URL = "http://localhost:8080"

const api = {
  children: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/children`)
      try {
        const response = await fetch(`${API_BASE_URL}/children`)
        console.log("Children API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Children API error:", errorText)
          throw new Error(`Failed to fetch children: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Children data received:", data)
        return data
      } catch (error) {
        console.error("Children API fetch error:", error)
        throw error
      }
    },
  },
  attendance: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/attendance`)
      try {
        const response = await fetch(`${API_BASE_URL}/attendance`)
        console.log("Attendance API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Attendance API error:", errorText)
          throw new Error(`Failed to fetch attendance: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Attendance data received:", data)
        return data
      } catch (error) {
        console.error("Attendance API fetch error:", error)
        throw error
      }
    },
  },
  billing: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/billing`)
      try {
        const response = await fetch(`${API_BASE_URL}/billing`)
        console.log("Billing API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Billing API error:", errorText)
          throw new Error(`Failed to fetch billing: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Billing data received:", data)
        return data
      } catch (error) {
        console.error("Billing API fetch error:", error)
        throw error
      }
    },
  },
  shift: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/shift`)
      try {
        const response = await fetch(`${API_BASE_URL}/shift`)
        console.log("Shift API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Shift API error:", errorText)
          throw new Error(`Failed to fetch shift: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Shift data received:", data)
        return data
      } catch (error) {
        console.error("Shift API fetch error:", error)
        throw error
      }
    },
  },
  health: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/health`)
      try {
        const response = await fetch(`${API_BASE_URL}/health`)
        console.log("Health API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Health API error:", errorText)
          throw new Error(`Failed to fetch health: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Health data received:", data)
        return data
      } catch (error) {
        console.error("Health API fetch error:", error)
        throw error
      }
    },
  },
  event: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/calendar/events`)
      try {
        const response = await fetch(`${API_BASE_URL}/calendar/events`)
        console.log("Event API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Event API error:", errorText)
          throw new Error(`Failed to fetch event: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Event data received:", data)
        return data
      } catch (error) {
        console.error("Event API fetch error:", error)
        throw error
      }
    },
  },
  booking: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/bookings`)
      try {
        const response = await fetch(`${API_BASE_URL}/bookings`)
        console.log("Booking API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Booking API error:", errorText)
          throw new Error(`Failed to fetch booking: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Booking data received:", data)
        return data
      } catch (error) {
        console.error("Booking API fetch error:", error)
        throw error
      }
    },
  },
  media: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/media/items`)
      try {
        const response = await fetch(`${API_BASE_URL}/media/items`)
        console.log("Media API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Media API error:", errorText)
          throw new Error(`Failed to fetch media: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Media data received:", data)
        return data
      } catch (error) {
        console.error("Media API fetch error:", error)
        throw error
      }
    },
  },
  staff: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/staff`)
      try {
        const response = await fetch(`${API_BASE_URL}/staff`)
        console.log("Staff API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Staff API error:", errorText)
          throw new Error(`Failed to fetch staff: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Staff data received:", data)
        return data
      } catch (error) {
        console.error("Staff API fetch error:", error)
        throw error
      }
    },
  },
  user: {
    getAll: async () => {
      console.log("Fetching from:", `${API_BASE_URL}/users`)
      try {
        const response = await fetch(`${API_BASE_URL}/users`)
        console.log("User API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("User API error:", errorText)
          throw new Error(`Failed to fetch user: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("User data received:", data)
        return data
      } catch (error) {
        console.error("User API fetch error:", error)
        throw error
      }
    },
  },
}

class DataIntegrationService {
  async fetchData(intent: QueryIntent): Promise<DataResult> {
    const { entity, type, filters, timeframe } = intent

    try {
      console.log(`🔍 Fetching data: ${entity} (${type})`, { filters, timeframe })

      switch (entity) {
        case "report":
          return await this.fetchReportData()
        case "children":
          return await this.fetchChildrenData(type, filters, timeframe)
        case "attendance":
          return await this.fetchAttendanceData(type, filters, timeframe)
        case "billing":
          return await this.fetchBillingData(type, filters, timeframe)
        case "shift":
          return await this.fetchShiftData(type, filters, timeframe)
        case "health":
          return await this.fetchHealthData(type, filters, timeframe)
        case "media":
          return await this.fetchMediaData(type, filters, timeframe)
        case "event":
          return await this.fetchEventData(type, filters, timeframe)
        case "booking":
          return await this.fetchBookingData(type, filters, timeframe)
        case "staff":
          return await this.fetchStaffData(type, filters, timeframe)
        case "user":
          return await this.fetchUserData(type, filters, timeframe)
        default:
          throw new Error(`Unsupported entity: ${entity}`)
      }
    } catch (error) {
      console.error(`❌ Error fetching data for ${entity}:`, error)
      throw error
    }
  }

  private async fetchReportData(): Promise<DataResult> {
    console.log("Starting comprehensive report data fetch...")

    try {
      const [children, attendance, billing, staff, health, shift, event, booking, user] = await Promise.all([
        api.children.getAll(),
        api.attendance.getAll(),
        api.billing.getAll(),
        api.health.getAll(),
        api.shift.getAll(),
        api.event.getAll(),
        api.media.getAll(),
        api.booking.getAll(),
        api.staff.getAll(),
        api.user.getAll(),


      ])

      console.log("All API calls completed successfully")

      const today = new Date().toISOString().split("T")[0]
      const todayRecords = attendance.filter((a: any) => a.date?.startsWith(today) || a.timestamp?.startsWith(today))

      const report = {
        totalChildren: children.length || 0,
        presentToday: todayRecords.filter((r: any) => r.status === "present").length || 0,
        absentToday: todayRecords.filter((r: any) => r.status === "absent").length || 0,
        totalAttendanceRecords: todayRecords.length || 0,
        totalRevenue: billing.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
        outstandingInvoices: billing.filter((b: any) => b.status === "unpaid" || b.status === "pending").length || 0,
        totalStaff: staff?.length || 0,
        highPriorityAlerts: health.filter((h: any) => h.severity === "high" || h.priority === "high").length || 0,
        medicationsDue: health.filter((h: any) => h.type === "medication").length || 0,
        upcomingEvents: shift.filter((e: any) => new Date(e.time || e.date) > new Date()).length || 0,
        todayEventsCount: shift.filter((e: any) => (e.time || e.date)?.startsWith(today)).length || 0,
        upcomingTours: shift.filter((e: any) => e.type === "tour").length || 0,
        totalMediaItems: event.length || 0,
        photos: event.filter((m: any) => m.type === "photo").length || 0,
        videos: event.filter((m: any) => m.type === "video").length || 0,
        recentMedia: [...event]
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 3),
        timestamp: new Date().toISOString(),

      }

      console.log("Report generated successfully:", report)

      return {
        data: report,
        metadata: { source: "multi-api-report", timestamp: new Date().toISOString() },
      }
    } catch (error) {
      console.error("Error in fetchReportData:", error)
      throw error
    }
  }

  private async fetchChildrenData(
    type: string,
    filters?: Record<string, any>,
    timeframe?: string,
  ): Promise<DataResult> {
    const allChildren = await api.children.getAll()
    if (type === "analyze") {
      const recent = [...allChildren]
        .sort((a: any, b: any) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
        .slice(0, 3)
      const data = { total: allChildren.length, recent }
      return { data, metadata: { source: "children-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allChildren,
      count: allChildren.length,
      metadata: { source: "children-api", timestamp: new Date().toISOString() },
    }
  }
  private async fetchStaffData(type: string, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allStaff = await api.staff.getAll()
    if (type === "analyze") {
      const active = allStaff.filter((s: any) => s.status === "active").length
      const inactive = allStaff.filter((s: any) => s.status === "inactive").length
      const data = { totalRecords: allStaff.length, active, inactive }
      return { data, metadata: { source: "staff-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allStaff,
      count: allStaff.length,
      metadata: { source: "staff-api", timestamp: new Date().toISOString() },
    }
  }

  private async fetchAttendanceData(
    type: string,
    filters?: Record<string, any>,
    timeframe?: string,
  ): Promise<DataResult> {
    const allAttendance = await api.attendance.getAll()
    if (type === "analyze") {
      const todayRecords = allAttendance
      const present = todayRecords.filter((r: any) => r.status === "present").length
      const absent = todayRecords.filter((r: any) => r.status === "absent").length
      const data = { present, absent, total: todayRecords.length }
      return { data, metadata: { source: "attendance-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allAttendance,
      count: allAttendance.length,
      metadata: { source: "attendance-api", timestamp: new Date().toISOString() },
    }
  }

  private async fetchBillingData(type: string, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allBilling = await api.billing.getAll()
    if (type === "analyze") {
      const revenue = allBilling.reduce((sum: number, b: any) => sum + b.amount, 0)
      const outstanding = allBilling.filter((b: any) => b.status === "unpaid").length
      const data = { revenue, outstanding }
      return { data, metadata: { source: "billing-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allBilling,
      count: allBilling.length,
      metadata: { source: "billing-api", timestamp: new Date().toISOString() },
    }
  }

  private async fetchShiftData(type: string, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allShift = await api.shift.getAll()
    if (type === "analyze") {
      const onDuty = allShift.filter((s: any) => s.onShift).length
      const teachers = allShift.filter((s: any) => s.role.toLowerCase().includes("teacher")).length
      const data = { total: allShift.length, onDuty, teachers }
      return { data, metadata: { source: "shift-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allShift,
      count: allShift.length,
      metadata: { source: "shift-api", timestamp: new Date().toISOString() },
    }
  }

  private async fetchHealthData(type: string, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allHealth = await api.health.getAll()
    if (type === "analyze") {
      const allergies = allHealth.filter((h: any) => h.type === "allergy").length
      const medications = allHealth.filter((h: any) => h.type === "medication").length
      const highPriority = allHealth.filter((h: any) => h.severity === "high").length
      const data = { totalRecords: allHealth.length, allergies, medications, highPriority }
      return { data, metadata: { source: "health-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allHealth,
      count: allHealth.length,
      metadata: { source: "health-api", timestamp: new Date().toISOString() },
    }
  }

  private async fetchEventData(
    type: string,
    filters?: Record<string, any>,
    timeframe?: string,
  ): Promise<DataResult> {
    const allEvents = await api.event.getAll()
    if (type === "analyze") {
      const today = new Date().toISOString().split("T")[0]
      const todayEvents = allEvents.filter((e: any) => e.time.startsWith(today))
      const tours = allEvents.filter((e: any) => e.type === "tour").length
      const upcoming = allEvents.filter((e: any) => new Date(e.time) > new Date()).slice(0, 3)
      const data = { todayEvents, tours, upcoming }
      return { data, metadata: { source: "event-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allEvents,
      count: allEvents.length,
      metadata: { source: "event-api", timestamp: new Date().toISOString() },
    }
  }

  private async fetchBookingData(type: string, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allBookings = await api.booking.getAll()
    if (type === "analyze") {
      const upcoming = allBookings.filter((b: any) => new Date(b.startTime) > new Date()).length
      const data = { total: allBookings.length, upcoming }
      return { data, metadata: { source: "booking-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allBookings,
      count: allBookings.length,
      metadata: { source: "booking-api", timestamp: new Date().toISOString() },
    }
  }
  private async fetchUserData(type: string, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allUsers = await api.user.getAll()
    if (type === "analyze") {
      const active = allUsers.filter((u: any) => u.status === "active").length
      const data = { total: allUsers.length, active }
      return { data, metadata: { source: "user-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allUsers,
      count: allUsers.length,
      metadata: { source: "user-api", timestamp: new Date().toISOString() },
    }
  }

  private async fetchMediaData(type: string, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allMedia = await api.media.getAll()
    if (type === "analyze") {
      const photos = allMedia.filter((m: any) => m.type === "photo").length
      const videos = allMedia.filter((m: any) => m.type === "video").length
      const recent = [...allMedia]
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3)
      const data = { total: allMedia.length, photos, videos, recent }
      return { data, metadata: { source: "media-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allMedia,
      count: allMedia.length,
      metadata: { source: "media-api", timestamp: new Date().toISOString() },
    }
  }
  
}

export const dataIntegrationService = new DataIntegrationService()
