import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For sending HTTPOnly cookies (refresh token)
  timeout: 10000, // Timeout after 10 seconds instead of hanging forever
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup Interceptors for Dual-Token Security
apiClient.interceptors.request.use(
  (config) => {
    // Get access token directly from Zustand state
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loop if the refresh token itself fails
    if (error.response?.status === 401 && originalRequest.url === '/api/v1/auth/refresh') {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    // If 401 Unauthorized and we haven't retried yet, AND it's not a login request
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/v1/auth/login') {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token using the HTTPOnly cookie
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        
        const { user, accessToken } = response.data.data;
        useAuthStore.getState().setAuth(user, accessToken);
        
        // Update the authorization header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g. cookie expired), logout the user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
