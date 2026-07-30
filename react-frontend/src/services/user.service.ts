import { apiClient } from './api/apiClient';

export const UserService = {
  getUsers: async (params?: Record<string, any>) => {
    return await apiClient.get('/api/v1/admin/users', { params });
  },
  getUserById: async (id: string) => {
    return await apiClient.get(`/api/v1/admin/users/${id}`);
  },
  createUser: async (data: any) => {
    return await apiClient.post('/api/v1/admin/users', data);
  },
  updateUser: async (id: string, data: any) => {
    return await apiClient.patch(`/api/v1/admin/users/${id}`, data);
  },
  deleteUser: async (id: string) => {
    return await apiClient.delete(`/api/v1/admin/users/${id}`);
  }
};
