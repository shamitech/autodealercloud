import { apiClient } from './api-client'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'member'
  tenantId?: string
  createdAt: string
  updatedAt?: string
}

export interface UserResponse {
  success: boolean
  data: User | User[]
}

class UserService {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<UserResponse>('/users')
    return Array.isArray(response.data) ? response.data : [response.data]
  }

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`)
    return Array.isArray(response.data) ? response.data[0] : response.data
  }

  async createUser(data: Partial<User> & { password: string }): Promise<User> {
    const response = await apiClient.post<UserResponse>('/users', data)
    return Array.isArray(response.data) ? response.data[0] : response.data
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<UserResponse>(`/users/${id}`, data)
    return Array.isArray(response.data) ? response.data[0] : response.data
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  }
}

export const userService = new UserService()
