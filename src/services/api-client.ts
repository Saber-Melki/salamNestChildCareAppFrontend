export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

export class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, "") // Remove trailing slash
    this.timeout = config.timeout || 10000
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(data.message || `HTTP ${response.status}: ${response.statusText}`, response.status, data)
      }

      return {
        data,
        status: response.status,
        message: data.message,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      if (typeof error === "object" && error !== null && "name" in error && (error as any).name === "AbortError") {
        throw new ApiError("Request timeout", 408)
      }

      throw new ApiError(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "Network error occurred"
          : "Network error occurred",
        0,
        error
      )
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // Method to update authorization header
  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  // Method to remove authorization header
  clearAuthToken() {
    delete this.defaultHeaders["Authorization"]
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}
