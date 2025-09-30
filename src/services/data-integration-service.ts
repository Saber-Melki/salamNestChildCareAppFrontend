interface QueryIntent {
  entity: "children" | "attendance" | "billing" | "staff" | "health" | "schedule" | "media" | "report"
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
      console.log("[v0] Fetching from:", `${API_BASE_URL}/children`)
      try {
        const response = await fetch(`${API_BASE_URL}/children`)
        console.log("[v0] Children API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Children API error:", errorText)
          throw new Error(`Failed to fetch children: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("[v0] Children data received:", data)
        return data
      } catch (error) {
        console.error("[v0] Children API fetch error:", error)
        throw error
      }
    },
  },
  attendance: {
    getAll: async () => {
      console.log("[v0] Fetching from:", `${API_BASE_URL}/attendance`)
      try {
        const response = await fetch(`${API_BASE_URL}/attendance`)
        console.log("[v0] Attendance API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Attendance API error:", errorText)
          throw new Error(`Failed to fetch attendance: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("[v0] Attendance data received:", data)
        return data
      } catch (error) {
        console.error("[v0] Attendance API fetch error:", error)
        throw error
      }
    },
  },
  billing: {
    getAll: async () => {
      console.log("[v0] Fetching from:", `${API_BASE_URL}/billing`)
      try {
        const response = await fetch(`${API_BASE_URL}/billing`)
        console.log("[v0] Billing API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Billing API error:", errorText)
          throw new Error(`Failed to fetch billing: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("[v0] Billing data received:", data)
        return data
      } catch (error) {
        console.error("[v0] Billing API fetch error:", error)
        throw error
      }
    },
  },
  staff: {
    getAll: async () => {
      console.log("[v0] Fetching from:", `${API_BASE_URL}/staff`)
      try {
        const response = await fetch(`${API_BASE_URL}/staff`)
        console.log("[v0] Staff API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Staff API error:", errorText)
          throw new Error(`Failed to fetch staff: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("[v0] Staff data received:", data)
        return data
      } catch (error) {
        console.error("[v0] Staff API fetch error:", error)
        throw error
      }
    },
  },
  health: {
    getAll: async () => {
      console.log("[v0] Fetching from:", `${API_BASE_URL}/health`)
      try {
        const response = await fetch(`${API_BASE_URL}/health`)
        console.log("[v0] Health API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Health API error:", errorText)
          throw new Error(`Failed to fetch health: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("[v0] Health data received:", data)
        return data
      } catch (error) {
        console.error("[v0] Health API fetch error:", error)
        throw error
      }
    },
  },
  schedule: {
    getAll: async () => {
      console.log("[v0] Fetching from:", `${API_BASE_URL}/schedule`)
      try {
        const response = await fetch(`${API_BASE_URL}/schedule`)
        console.log("[v0] Schedule API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Schedule API error:", errorText)
          throw new Error(`Failed to fetch schedule: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("[v0] Schedule data received:", data)
        return data
      } catch (error) {
        console.error("[v0] Schedule API fetch error:", error)
        throw error
      }
    },
  },
  media: {
    getAll: async () => {
      console.log("[v0] Fetching from:", `${API_BASE_URL}/media`)
      try {
        const response = await fetch(`${API_BASE_URL}/media`)
        console.log("[v0] Media API response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Media API error:", errorText)
          throw new Error(`Failed to fetch media: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("[v0] Media data received:", data)
        return data
      } catch (error) {
        console.error("[v0] Media API fetch error:", error)
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
        case "staff":
          return await this.fetchStaffData(type, filters, timeframe)
        case "health":
          return await this.fetchHealthData(type, filters, timeframe)
        case "schedule":
          return await this.fetchScheduleData(type, filters, timeframe)
        case "media":
          return await this.fetchMediaData(type, filters, timeframe)
        default:
          throw new Error(`Unsupported entity: ${entity}`)
      }
    } catch (error) {
      console.error(`❌ Error fetching data for ${entity}:`, error)
      throw error
    }
  }

  private async fetchReportData(): Promise<DataResult> {
    console.log("[v0] Starting comprehensive report data fetch...")

    try {
      const [children, attendance, billing, staff, health, schedule] = await Promise.all([
        api.children.getAll(),
        api.attendance.getAll(),
        api.billing.getAll(),
        api.staff.getAll(),
        api.health.getAll(),
        api.schedule.getAll(),
      ])

      console.log("[v0] All API calls completed successfully")

      const today = new Date().toISOString().split("T")[0]
      const todayRecords = attendance.filter((a: any) => a.date?.startsWith(today) || a.timestamp?.startsWith(today))

      const report = {
        totalChildren: children.length || 0,
        presentToday: todayRecords.filter((r: any) => r.status === "present").length || 0,
        absentToday: todayRecords.filter((r: any) => r.status === "absent").length || 0,
        totalAttendanceRecords: todayRecords.length || 0,
        totalRevenue: billing.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
        outstandingInvoices: billing.filter((b: any) => b.status === "unpaid" || b.status === "pending").length || 0,
        totalStaff: staff.length || 0,
        highPriorityAlerts: health.filter((h: any) => h.severity === "high" || h.priority === "high").length || 0,
        medicationsDue: health.filter((h: any) => h.type === "medication").length || 0,
        upcomingEvents: schedule.filter((e: any) => new Date(e.time || e.date) > new Date()).length || 0,
        todayEventsCount: schedule.filter((e: any) => (e.time || e.date)?.startsWith(today)).length || 0,
        upcomingTours: schedule.filter((e: any) => e.type === "tour").length || 0,
      }

      console.log("[v0] Report generated successfully:", report)

      return {
        data: report,
        metadata: { source: "multi-api-report", timestamp: new Date().toISOString() },
      }
    } catch (error) {
      console.error("[v0] Error in fetchReportData:", error)
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

  private async fetchStaffData(type: string, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allStaff = await api.staff.getAll()
    if (type === "analyze") {
      const onDuty = allStaff.filter((s: any) => s.onShift).length
      const teachers = allStaff.filter((s: any) => s.role.toLowerCase().includes("teacher")).length
      const data = { total: allStaff.length, onDuty, teachers }
      return { data, metadata: { source: "staff-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allStaff,
      count: allStaff.length,
      metadata: { source: "staff-api", timestamp: new Date().toISOString() },
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

  private async fetchScheduleData(
    type: string,
    filters?: Record<string, any>,
    timeframe?: string,
  ): Promise<DataResult> {
    const allSchedule = await api.schedule.getAll()
    if (type === "analyze") {
      const today = new Date().toISOString().split("T")[0]
      const todayEvents = allSchedule.filter((e: any) => e.time.startsWith(today))
      const tours = allSchedule.filter((e: any) => e.type === "tour").length
      const upcoming = allSchedule.filter((e: any) => new Date(e.time) > new Date()).slice(0, 3)
      const data = { todayEvents, tours, upcoming }
      return { data, metadata: { source: "schedule-api", timestamp: new Date().toISOString() } }
    }
    return {
      data: allSchedule,
      count: allSchedule.length,
      metadata: { source: "schedule-api", timestamp: new Date().toISOString() },
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
