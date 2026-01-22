import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export const cmsApi = axios.create({
  baseURL: API_BASE_URL,
});

cmsApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cms_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default cmsApi;
