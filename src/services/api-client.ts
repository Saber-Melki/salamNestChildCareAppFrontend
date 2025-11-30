// src/services/api-client.ts
import Cookies from "js-cookie"

class ApiClient {
  private baseURL: string = "http://localhost:8080"

  isAuthenticated(): boolean {
    return Boolean(Cookies.get("accessToken"))
  }

  /**
   * Generic request helper used by get/post/put/delete
   */
  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: any,
  ): Promise<T> {
    const url = `${this.baseURL}${path}`

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // important: send cookies
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    // Handle auth errors globally
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this.logout().catch(() => {
          // ignore logout error here
        })
      }

      let errorMessage = `API error: ${response.status} ${response.statusText}`

      try {
        const data = await response.json()
        if (data && (data.message || data.error)) {
          errorMessage = data.message || data.error
        }
      } catch {
        // ignore JSON parse error, keep default message
      }

      throw new Error(errorMessage)
    }

    // No content
    if (response.status === 204) {
      return undefined as T
    }

    // Try JSON, fallback to text
    const contentType = response.headers.get("Content-Type") || ""
    if (contentType.includes("application/json")) {
      return (await response.json()) as T
    }

    const text = (await response.text()) as unknown as T
    return text
  }

  // ---------- AUTH SPECIFIC ----------

  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Invalid credentials")
    }

    // If backend sets HttpOnly cookie, browser stores it automatically.
    // You can still return the body (e.g., user info).
    return response.json()
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        console.error("Failed to log out on server.")
      }
    } catch (err) {
      console.error("Logout request failed:", err)
    }

    // Remove non-HttpOnly token if stored on client
    Cookies.remove("accessToken")
  }

  // ---------- HTTP HELPERS ----------

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path)
  }

  async post<T>(path: string, data?: any): Promise<T> {
    return this.request<T>("POST", path, data)
  }

  async put<T>(path: string, data?: any): Promise<T> {
    return this.request<T>("PUT", path, data)
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path)
  }
}

export const apiClient = new ApiClient()
