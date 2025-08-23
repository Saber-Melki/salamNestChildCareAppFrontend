import { ApiClient, type ApiResponse } from "./api-client"
import { MicroservicesConfig } from "./microservices-config"

export interface LoginCredentials {
  email: string
  password: string
  role?: "admin" | "staff" | "parent"
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "staff" | "parent"
  permissions: string[]
  tenantId?: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export class AuthService {
  private apiClient: ApiClient
  private static instance: AuthService

  private constructor() {
    const config = MicroservicesConfig.getInstance()
    this.apiClient = new ApiClient({
      baseURL: config.getEndpoint("auth"),
      timeout: 15000,
    })
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.apiClient.post<AuthResponse>("/auth/login", credentials)

    // Store tokens in localStorage
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      // Set auth token for future requests
      this.apiClient.setAuthToken(response.data.accessToken)
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post("/auth/logout")
    } catch (error) {
      console.warn("Logout request failed:", error)
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      this.apiClient.clearAuthToken()
    }
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await this.apiClient.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    })

    // Update stored tokens
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      this.apiClient.setAuthToken(response.data.accessToken)
    }

    return response
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  async validateToken(): Promise<boolean> {
    const token = localStorage.getItem("accessToken")
    if (!token) return false

    try {
      this.apiClient.setAuthToken(token)
      await this.apiClient.get("/auth/validate")
      return true
    } catch {
      return false
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken")
  }

  getAuthToken(): string | null {
    return localStorage.getItem("accessToken")
  }
}
