export interface MicroserviceEndpoints {
  auth: string
  users: string
  children: string
  attendance: string
  billing: string
  notifications: string
  reports: string
}

export class MicroservicesConfig {
  private static instance: MicroservicesConfig
  private endpoints: MicroserviceEndpoints

  private constructor() {
    this.endpoints = {
      auth: process.env.REACT_APP_AUTH_SERVICE_URL || "http://localhost:3001",
      users: process.env.REACT_APP_USER_SERVICE_URL || "http://localhost:3002",
      children: process.env.REACT_APP_CHILDREN_SERVICE_URL || "http://localhost:3003",
      attendance: process.env.REACT_APP_ATTENDANCE_SERVICE_URL || "http://localhost:3004",
      billing: process.env.REACT_APP_BILLING_SERVICE_URL || "http://localhost:3005",
      notifications: process.env.REACT_APP_NOTIFICATIONS_SERVICE_URL || "http://localhost:3006",
      reports: process.env.REACT_APP_REPORTS_SERVICE_URL || "http://localhost:3007",
    }
  }

  static getInstance(): MicroservicesConfig {
    if (!MicroservicesConfig.instance) {
      MicroservicesConfig.instance = new MicroservicesConfig()
    }
    return MicroservicesConfig.instance
  }

  getEndpoint(service: keyof MicroserviceEndpoints): string {
    return this.endpoints[service]
  }

  getAllEndpoints(): MicroserviceEndpoints {
    return { ...this.endpoints }
  }

  // Method to update endpoints at runtime if needed
  updateEndpoint(service: keyof MicroserviceEndpoints, url: string): void {
    this.endpoints[service] = url
  }
}
