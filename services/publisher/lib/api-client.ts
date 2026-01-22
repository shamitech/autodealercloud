import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_PUBLISHER_API_URL || 'http://localhost:3003/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const publisherApi = apiClient;
export default apiClient;

