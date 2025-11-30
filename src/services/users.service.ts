// src/services/users-service.ts
import { apiClient } from "./api-client"

export type UserRole = "admin" | "staff" | "parent"

// This matches what your backend actually stores/returns
export interface User {
  user_id: number
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone?: string | null
  url_img?: string | null
}

// DTO for creating a user (frontend side)
// NOTE: we use snake_case to be aligned with your backend DTO
export interface CreateUserData {
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone?: string
  address?: string
}

// DTO for updating a user
// `id` is required and must correspond to `user_id` in DB
export interface UpdateUserData extends Partial<CreateUserData> {
  id: number | string
}

export interface UserFilters {
  role?: string
  search?: string
  page?: number
  limit?: number
}

// Right now your backend returns a simple array from GET /users,
// not a paginated object. If you implement pagination later, you
// can switch back to this shape.
// For now, we'll keep it but note: the API actually returns User[]
export interface PaginatedUsers {
  users: User[]
  total: number
  page: number
  totalPages: number
}

class UsersService {
  /**
   * Get all users.
   * NOTE: your backend currently returns a plain array of users.
   * If you later add pagination in the API Gateway, you can
   * change this return type to PaginatedUsers.
   */
  async getUsers(filters: UserFilters = {}): Promise<User[]> {
    const queryParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    const queryString = queryParams.toString()
    const endpoint = `/users${queryString ? `?${queryString}` : ""}`

    return apiClient.get<User[]>(endpoint)
  }

  async getUserById(id: string | number): Promise<User> {
    return apiClient.get<User>(`/users/${id}`)
  }

  async createUser(userData: CreateUserData): Promise<User> {
    // If your backend DTO expects snake_case, this can be sent directly.
    // If it expects camelCase, you’d need a mapping here.
    return apiClient.post<User>("/users", userData)
  }

  async updateUser(userData: UpdateUserData): Promise<User> {
    const { id, ...updateData } = userData

    if (
      id === undefined ||
      id === null ||
      id === "" ||
      Number.isNaN(Number(id))
    ) {
      // This prevents `/users/undefined` and gives you a clear error in the front.
      throw new Error(`updateUser called without a valid id: ${id}`)
    }

    // Here we assume your backend UpdateUserDto uses snake_case:
    // first_name, last_name, phone, role, email, etc.
    // If your form uses camelCase, convert here before sending.
    return apiClient.put<User>(`/users/${id}`, updateData)
  }

  async deleteUser(id: string | number): Promise<void> {
    if (
      id === undefined ||
      id === null ||
      id === "" ||
      Number.isNaN(Number(id))
    ) {
      throw new Error(`deleteUser called without a valid id: ${id}`)
    }

    await apiClient.delete<void>(`/users/${id}`)
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return apiClient.get<User[]>(`/users/by-role/${role}`)
  }
}

export const usersService = new UsersService()
