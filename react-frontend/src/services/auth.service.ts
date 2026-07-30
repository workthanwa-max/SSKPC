import { apiClient } from './api/apiClient';

export const AuthService = {
  login: async (data: any) => {
    return await apiClient.post('/api/v1/auth/login', data);
  },
  logout: async () => {
    return await apiClient.post('/api/v1/auth/logout');
  },
  refresh: async () => {
    return await apiClient.post('/api/v1/auth/refresh');
  },
  getMe: async () => {
    return await apiClient.get('/api/v1/auth/me');
  },
};
