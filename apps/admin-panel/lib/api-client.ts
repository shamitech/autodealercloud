const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, any>
  headers?: Record<string, string>
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `API error: ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  async put<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
