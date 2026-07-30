import { apiClient } from './api/apiClient';

export const MonitoringService = {
  getAuditLogs: async (params?: Record<string, any>) => {
    return await apiClient.get('/api/v1/admin/monitoring/audit-logs', { params });
  }
};
