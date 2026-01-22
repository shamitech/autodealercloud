import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  // Tenants
  getTenants: () => api.get('/api/tenants'),
  getTenantById: (id: string) => api.get(`/api/tenants/${id}`),
  createTenant: (data: any) => api.post('/api/tenants', data),
  updateTenant: (id: string, data: any) => api.put(`/api/tenants/${id}`, data),
  deleteTenant: (id: string) => api.delete(`/api/tenants/${id}`),
  resetTenantPassword: (id: string) => api.post(`/api/tenants/${id}/reset-password`),
};

export default api;
