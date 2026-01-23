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
    const data = Array.isArray(response.data) ? response.data : [response.data]
    return (data as User[])
  }

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`)
    const data = Array.isArray(response.data) ? response.data[0] : response.data
    return (data as User)
  }

  async createUser(data: Partial<User> & { password: string }): Promise<User> {
    const response = await apiClient.post<UserResponse>('/users', data)
    const result = Array.isArray(response.data) ? response.data[0] : response.data
    return (result as User)
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<UserResponse>(`/users/${id}`, data)
    const result = Array.isArray(response.data) ? response.data[0] : response.data
    return (result as User)
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  }
}

export const userService = new UserService()
