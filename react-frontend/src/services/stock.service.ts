import { apiClient } from './api/apiClient';

export const StockService = {
  // --- Categories ---
  getCategories: async (params?: Record<string, any>) => {
    return await apiClient.get('/api/v1/dashboard/stock/categories', { params });
  },
  createCategory: async (data: any) => {
    return await apiClient.post('/api/v1/dashboard/stock/categories', data);
  },
  updateCategory: async (id: string, data: any) => {
    return await apiClient.patch(`/api/v1/dashboard/stock/categories/${id}`, data);
  },
  deleteCategory: async (id: string) => {
    return await apiClient.delete(`/api/v1/dashboard/stock/categories/${id}`);
  },

  // --- Products ---
  getProducts: async (params?: Record<string, any>) => {
    return await apiClient.get('/api/v1/dashboard/stock/products', { params });
  },
  createProduct: async (data: any) => {
    return await apiClient.post('/api/v1/dashboard/stock/products', data);
  },
  updateProduct: async (id: string, data: any) => {
    return await apiClient.patch(`/api/v1/dashboard/stock/products/${id}`, data);
  },
  deleteProduct: async (id: string) => {
    return await apiClient.delete(`/api/v1/dashboard/stock/products/${id}`);
  },

  // --- Transactions ---
  getTransactions: async (params?: Record<string, any>) => {
    return await apiClient.get('/api/v1/dashboard/stock/transactions', { params });
  },
  createTransaction: async (data: any) => {
    return await apiClient.post('/api/v1/dashboard/stock/transactions', data);
  },

  // --- Common Dashboard ---
  getDashboardSummary: async () => {
    return await apiClient.get('/api/v1/dashboard/stock/summary');
  }
};
