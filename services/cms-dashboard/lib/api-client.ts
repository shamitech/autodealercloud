import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:3011';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const cmsApi = {
  // Auth
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  // Components
  getComponents: () => api.get('/api/components'),
  getComponentById: (id: string) => api.get(`/api/components/${id}`),
  createComponent: (data: any) => api.post('/api/components', data),
  updateComponent: (id: string, data: any) => api.put(`/api/components/${id}`, data),
  deleteComponent: (id: string) => api.delete(`/api/components/${id}`),

  // Pages
  getPages: () => api.get('/api/pages'),
  getPageById: (id: string) => api.get(`/api/pages/${id}`),
  createPage: (data: any) => api.post('/api/pages', data),
  updatePage: (id: string, data: any) => api.put(`/api/pages/${id}`, data),
  deletePage: (id: string) => api.delete(`/api/pages/${id}`),
  publishPage: (id: string) => api.post(`/api/pages/${id}/publish`),
  unpublishPage: (id: string) => api.post(`/api/pages/${id}/unpublish`),
};

export default api;
