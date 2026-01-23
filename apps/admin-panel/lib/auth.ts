import { apiClient } from './api-client'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'member'
  tenantId?: string
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    })
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    })
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  }

  logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token')
    }
    return false
  }

  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  }
}

export const authService = new AuthService()
