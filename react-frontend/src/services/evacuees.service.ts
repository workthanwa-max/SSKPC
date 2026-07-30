import { apiClient as api } from './api/apiClient';

export interface Evacuee {
  id: string;
  registrationCode: string;
  name: string;
  basicInfo?: string;
  status: 'IN_SHELTER' | 'CHECKED_OUT';
  checkInAt: string;
  checkOutAt?: string;
}

export interface BranchDashboard {
  capacity: number;
  currentOccupancy: number;
  specInfo?: string;
}

export interface CentralDashboard {
  totalCapacity: number;
  totalOccupancy: number;
}

export interface CentralBranch {
  id: string;
  name: string;
  capacity: number | null;
  _count: { evacuees: number };
}

export const evacueesService = {
  // BRANCH
  getBranchDashboard: () => api.get<{ data: BranchDashboard }>('/api/v1/evacuees/branch/dashboard').then((res: any) => res.data.data),
  updateCapacity: (capacity: number, specInfo?: string) => api.patch('/api/v1/evacuees/branch/location/capacity', { capacity, specInfo }).then((res: any) => res.data),
  checkIn: (data: { name: string; basicInfo?: string }) => api.post('/api/v1/evacuees/branch/check-in', data).then((res: any) => res.data),
  checkOut: (identifier: string) => api.post('/api/v1/evacuees/branch/check-out', { identifier }).then((res: any) => res.data),
  getBranchInShelter: () => api.get<{ data: Evacuee[] }>('/api/v1/evacuees/branch/in-shelter').then((res: any) => res.data.data),
  getBranchHistory: () => api.get<{ data: Evacuee[] }>('/api/v1/evacuees/branch/history').then((res: any) => res.data.data),

  // CENTRAL
  getCentralDashboard: () => api.get<{ data: CentralDashboard }>('/api/v1/evacuees/central/dashboard').then((res: any) => res.data.data),
  getCentralBranches: () => api.get<{ data: CentralBranch[] }>('/api/v1/evacuees/central/branches').then((res: any) => res.data.data),
  getCentralBranchPeople: (branchId: string) => api.get<{ data: Evacuee[] }>(`/api/v1/evacuees/central/branches/${branchId}/people`).then((res: any) => res.data.data),
};
