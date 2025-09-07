import { apiClient } from "./api-client"

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  role: "admin" | "staff" | "parent"
  phone?: string
  address?: string
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string
}

export interface UserFilters {
  role?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedUsers {
  users: any[]
  total: number
  page: number
  totalPages: number
}

class UsersService {
  async getUsers(filters: UserFilters = {}): Promise<PaginatedUsers> {
    const queryParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    const queryString = queryParams.toString()
    const endpoint = `/users${queryString ? `?${queryString}` : ""}`

    return apiClient.get<PaginatedUsers>(endpoint)
  }

  async getUserById(id: string): Promise<any> {
    return apiClient.get(`/users/${id}`)
  }

  async createUser(userData: CreateUserData): Promise<any> {
    return apiClient.post("/users", userData)
  }

  async updateUser(userData: UpdateUserData): Promise<any> {
    const { id, ...updateData } = userData
    return apiClient.put(`/users/${id}`, updateData)
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  }

  async getUsersByRole(role: string): Promise<any[]> {
    return apiClient.get(`/users/by-role/${role}`)
  }
}

export const usersService = new UsersService()
