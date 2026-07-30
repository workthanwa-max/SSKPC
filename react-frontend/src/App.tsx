import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/authStore';
import { apiClient } from './services/api/apiClient';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { Toaster } from 'sonner';

export function App() {
  const { isInitialized, setAuth, logout, setInitialized } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await apiClient.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        const { user, accessToken } = response.data.data;
        setAuth(user, accessToken);
      } catch (error) {
        logout(); // Make sure user is logged out if refresh fails
      } finally {
        setInitialized();
      }
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [isInitialized, setAuth, logout, setInitialized]);

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
