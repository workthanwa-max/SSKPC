import { apiClient } from './api/apiClient';

export const LocationService = {
  // --- Public Locations ---
  getPublicLocations: async () => {
    return await apiClient.get('/api/v1/public/locations');
  },
  
  // --- Dashboard Locations ---
  getBranchLocation: async () => {
    return await apiClient.get('/api/v1/dashboard/locations/me');
  },
  updateBranchLocation: async (data: any) => {
    return await apiClient.patch('/api/v1/dashboard/locations/me', data);
  },
  
  // --- Central Operations ---
  getAllLocationsForCentral: async (params?: Record<string, any>) => {
    return await apiClient.get('/api/v1/dashboard/locations', { params });
  }
};
