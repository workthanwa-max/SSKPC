import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CENTRAL' | 'BRANCH';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isInitialized: true }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false, isInitialized: true }),
  setInitialized: () => set({ isInitialized: true }),
}));
