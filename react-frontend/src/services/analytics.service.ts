import { apiClient } from './api/apiClient';

export interface BranchSurvivalMetric {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  dailyConsumptionRate: number;
  dailyBurnRate: number;
  ttd: number;
  status: 'CRITICAL' | 'WARNING' | 'HEALTHY';
}

export interface BranchSurvivalData {
  currentOccupancy: number;
  capacity: number;
  survivalDays: number;
  metrics: BranchSurvivalMetric[];
}

export interface CentralSurvivalData {
  branchId: string;
  branchName: string;
  officerName: string;
  currentOccupancy: number;
  capacity: number;
  survivalDays: number;
  criticalItemsCount: number;
}

export const analyticsService = {
  getBranchSurvival: async (): Promise<BranchSurvivalData> => {
    const response = await apiClient.get('/api/v1/analytics/survival/branch/me');
    return response.data.data;
  },

  getCentralSurvival: async (): Promise<CentralSurvivalData[]> => {
    const response = await apiClient.get('/api/v1/analytics/survival/central/overview');
    return response.data.data;
  }
};
