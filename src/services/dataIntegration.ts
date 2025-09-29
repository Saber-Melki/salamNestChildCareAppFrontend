import { childrenApi, attendanceApi, billingApi, staffApi, healthApi, scheduleApi, mediaApi } from './data-api';
import type { QueryIntent, DataResult, QueryType } from '../types';

class DataIntegrationService {
  async fetchData(intent: QueryIntent): Promise<DataResult> {
    const { entity, type, filters, timeframe, aggregation } = intent;

    try {
      console.log(`🔍 Fetching data: ${entity} (${type})`, { filters, timeframe });

      switch (entity) {
        case 'children':
          return await this.fetchChildrenData(type, filters, timeframe);
        case 'attendance':
          return await this.fetchAttendanceData(type, filters, timeframe);
        case 'billing':
          return await this.fetchBillingData(type, filters, timeframe);
        case 'staff':
            return await this.fetchStaffData(type, filters, timeframe);
        case 'health':
            return await this.fetchHealthData(type, filters, timeframe);
        case 'schedule':
            return await this.fetchScheduleData(type, filters, timeframe);
        case 'media':
            return await this.fetchMediaData(type, filters, timeframe);
        case 'report':
            return await this.fetchReportData();
        default:
          throw new Error(`Unsupported entity: ${entity}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching data for ${entity}:`, error);
      throw error;
    }
  }
  
  private async fetchReportData(): Promise<DataResult> {
    const [children, attendance, billing, staff, health, schedule] = await Promise.all([
        childrenApi.getAll(),
        attendanceApi.getAll(),
        billingApi.getAll(),
        staffApi.getAll(),
        healthApi.getAll(),
        scheduleApi.getAll(),
    ]);

    const today = new Date().toISOString().split("T")[0];
    const todayRecords = attendance.filter((a: any) => a.date.startsWith(today));
    
    const report = {
        totalChildren: children.length,
        presentToday: todayRecords.filter((r: any) => r.status === "present").length,
        absentToday: todayRecords.filter((r: any) => r.status === "absent").length,
        totalAttendanceRecords: todayRecords.length,
        totalRevenue: billing.reduce((sum: number, b: any) => sum + b.amount, 0),
        outstandingInvoices: billing.filter((b: any) => b.status === "unpaid").length,
        totalStaff: staff.length,
        highPriorityAlerts: health.filter((h: any) => h.severity === "high").length,
        medicationsDue: health.filter((h: any) => h.type === "medication").length,
        upcomingEvents: schedule.filter((e: any) => new Date(e.time) > new Date()).length,
        todayEventsCount: schedule.filter((e: any) => e.time.startsWith(today)).length,
        upcomingTours: schedule.filter((e: any) => e.type === "tour").length,
    };
    
    return {
        data: report,
        metadata: { source: 'multi-api-report', timestamp: new Date().toISOString() }
    };
  }

  private async fetchChildrenData(type: QueryType, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allChildren = await childrenApi.getAll();
    if (type === 'analyze') {
        const recent = [...allChildren]
            .sort((a: any, b: any) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
            .slice(0, 3);
        const data = { total: allChildren.length, recent };
        return { data, metadata: { source: 'children-api', timestamp: new Date().toISOString() } };
    }
    // Default to list
    return { data: allChildren, count: allChildren.length, metadata: { source: 'children-api', timestamp: new Date().toISOString() } };
  }
  
  private async fetchAttendanceData(type: QueryType, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
    const allAttendance = await attendanceApi.getAll();
    if (type === 'analyze') {
        const todayRecords = this.applyTimeframe(allAttendance, timeframe, 'date');
        const present = todayRecords.filter((r: any) => r.status === "present").length;
        const absent = todayRecords.filter((r: any) => r.status === "absent").length;
        const data = { present, absent, total: todayRecords.length };
        return { data, metadata: { source: 'attendance-api', timestamp: new Date().toISOString() } };
    }
    return { data: allAttendance, count: allAttendance.length, metadata: { source: 'attendance-api', timestamp: new Date().toISOString() } };
  }

  private async fetchBillingData(type: QueryType, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
      const allBilling = await billingApi.getAll();
      if (type === 'analyze') {
          const revenue = allBilling.reduce((sum: number, b: any) => sum + b.amount, 0);
          const outstanding = allBilling.filter((b: any) => b.status === "unpaid").length;
          const data = { revenue, outstanding };
          return { data, metadata: { source: 'billing-api', timestamp: new Date().toISOString() } };
      }
      return { data: allBilling, count: allBilling.length, metadata: { source: 'billing-api', timestamp: new Date().toISOString() } };
  }

  private async fetchStaffData(type: QueryType, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
      const allStaff = await staffApi.getAll();
      if (type === 'analyze') {
          const onDuty = allStaff.filter((s: any) => s.onShift).length;
          const teachers = allStaff.filter((s: any) => s.role.toLowerCase().includes("teacher")).length;
          const data = { total: allStaff.length, onDuty, teachers };
          return { data, metadata: { source: 'staff-api', timestamp: new Date().toISOString() } };
      }
      return { data: allStaff, count: allStaff.length, metadata: { source: 'staff-api', timestamp: new Date().toISOString() } };
  }

  private async fetchHealthData(type: QueryType, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
      const allHealth = await healthApi.getAll();
      if (type === 'analyze') {
          const allergies = allHealth.filter((h: any) => h.type === 'allergy').length;
          const medications = allHealth.filter((h: any) => h.type === 'medication').length;
          const highPriority = allHealth.filter((h: any) => h.severity === 'high').length;
          const data = { totalRecords: allHealth.length, allergies, medications, highPriority };
          return { data, metadata: { source: 'health-api', timestamp: new Date().toISOString() } };
      }
      return { data: allHealth, count: allHealth.length, metadata: { source: 'health-api', timestamp: new Date().toISOString() } };
  }

  private async fetchScheduleData(type: QueryType, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
      const allSchedule = await scheduleApi.getAll();
      if (type === 'analyze') {
          const today = new Date().toISOString().split("T")[0];
          const todayEvents = allSchedule.filter((e: any) => e.time.startsWith(today));
          const tours = allSchedule.filter((e: any) => e.type === 'tour').length;
          const upcoming = allSchedule.filter((e: any) => new Date(e.time) > new Date()).slice(0, 3);
          const data = { todayEvents, tours, upcoming };
          return { data, metadata: { source: 'schedule-api', timestamp: new Date().toISOString() } };
      }
      return { data: allSchedule, count: allSchedule.length, metadata: { source: 'schedule-api', timestamp: new Date().toISOString() } };
  }

  private async fetchMediaData(type: QueryType, filters?: Record<string, any>, timeframe?: string): Promise<DataResult> {
      const allMedia = await mediaApi.getAll();
      if (type === 'analyze') {
          const photos = allMedia.filter((m: any) => m.type === 'photo').length;
          const videos = allMedia.filter((m: any) => m.type === 'video').length;
          const recent = [...allMedia]
              .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 3);
          const data = { total: allMedia.length, photos, videos, recent };
          return { data, metadata: { source: 'media-api', timestamp: new Date().toISOString() } };
      }
      return { data: allMedia, count: allMedia.length, metadata: { source: 'media-api', timestamp: new Date().toISOString() } };
  }

  private applyFilters(data: any[], filters?: Record<string, any>): any[] {
    if (!filters || Object.keys(filters).length === 0) return data;

    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined) return true;

        const itemValue = item[key];
        if (typeof value === "string" && typeof itemValue === "string") {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        return itemValue === value;
      });
    });
  }

  private applyTimeframe(data: any[], timeframe?: string, dateField = "createdAt"): any[] {
    if (!timeframe) return data;

    const now = new Date();
    const startDate = new Date();
    
    if (timeframe === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        return data.filter(item => item[dateField] && item[dateField].startsWith(todayStr));
    }
    
    switch (timeframe) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter((item) => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= now;
    });
  }
}

export const dataIntegrationService = new DataIntegrationService();
