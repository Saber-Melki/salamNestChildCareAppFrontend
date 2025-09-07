import { apiClient } from "./api-client"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "staff" | "parent"
  permissions: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "staff" | "parent"
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    const tokens = await apiClient.login(credentials.email, credentials.password)
    const user = await this.getCurrentUser()
    return user
  }

  async logout(): Promise<void> {
    await apiClient.logout()
    // Clear any additional user data from localStorage
    localStorage.removeItem("auth:session")
    localStorage.removeItem("user:role")
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/auth/me")
  }

  async register(data: RegisterData): Promise<User> {
    return apiClient.post<User>("/auth/register", data)
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, newPassword })
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated()
  }
}

export const authService = new AuthService()
