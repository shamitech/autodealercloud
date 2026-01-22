import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_PUBLISHER_API_URL || 'http://localhost:3012';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const publisherApi = {
  // Published Pages - public read-only
  getPageBySlug: (tenantSlug: string, pageSlug: string) =>
    api.get(`/api/pages/${tenantSlug}/${pageSlug}`),
  
  getTenantPages: (tenantSlug: string) =>
    api.get(`/api/pages/${tenantSlug}`),
};

export default api;
