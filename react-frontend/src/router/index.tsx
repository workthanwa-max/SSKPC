import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import PublicHome from '../pages/public/PublicHome';
import Login from '../pages/auth/Login';
import AdminHome from '../pages/admin/AdminHome';
import UserManagement from '../pages/admin/UserManagement';
import { AuditLogsPage } from '../pages/admin/monitoring/AuditLogsPage';
import CentralHome from '../pages/central/CentralHome';
import CentralLocationsList from '../pages/central/CentralLocationsList';
import CentralLocationsMap from '../pages/central/CentralLocationsMap';
import CentralBranchesStock from '../pages/central/stock/CentralBranchesStock';
import CentralBranchStockDetail from '../pages/central/stock/CentralBranchStockDetail';
import BranchHome from '../pages/branch/BranchHome';
import BranchLocation from '../pages/branch/BranchLocation';
import StockDashboard from '../pages/branch/stock/StockDashboard';
import StockCategories from '../pages/branch/stock/StockCategories';
import StockProducts from '../pages/branch/stock/StockProducts';
import StockTransactions from '../pages/branch/stock/StockTransactions';
import Profile from '../pages/shared/Profile';
import NotFound from '../pages/NotFound';
import { useAuthStore } from '../store/authStore';

// Branch Evacuees Pages
import EvacueesDashboard from '../pages/branch/evacuees/EvacueesDashboard';
import EvacueesCapacity from '../pages/branch/evacuees/EvacueesCapacity';
import EvacueesCheckIn from '../pages/branch/evacuees/EvacueesCheckIn';
import EvacueesCheckOut from '../pages/branch/evacuees/EvacueesCheckOut';
import EvacueesHistory from '../pages/branch/evacuees/EvacueesHistory';
import EvacueesList from '../pages/branch/evacuees/EvacueesList';

// Branch Analytics Pages
import BranchSurvival from '../pages/branch/analytics/BranchSurvival';
import BranchStockReport from '../pages/branch/analytics/BranchStockReport';
import BranchEvacueeReport from '../pages/branch/analytics/BranchEvacueeReport';

// Central Evacuees Pages
import CentralEvacueesDashboard from '../pages/central/evacuees/CentralEvacueesDashboard';
import CentralEvacueesBranches from '../pages/central/evacuees/CentralEvacueesBranches';
import CentralEvacueesDirectory from '../pages/central/evacuees/CentralEvacueesDirectory';
import CentralEvacueesList from '../pages/central/evacuees/CentralEvacueesList';

// Central Analytics Pages
import CentralSurvival from '../pages/central/analytics/CentralSurvival';
import CentralStockReport from '../pages/central/analytics/CentralStockReport';
import CentralEvacueeReport from '../pages/central/analytics/CentralEvacueeReport';

// Helper component to redirect authenticated users away from Login
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'CENTRAL') return <Navigate to="/central" replace />;
    return <Navigate to="/branch" replace />;
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicHome />,
  },
  {
    path: '/login',
    element: (
      <AuthGuard>
        <Login />
      </AuthGuard>
    ),
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/admin',
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
          { path: '', element: <AdminHome /> },
          { path: 'users', element: <UserManagement /> },
          { path: 'monitoring/audit-logs', element: <AuditLogsPage /> }
        ],
      },
      {
        path: '/central',
        element: <ProtectedRoute allowedRoles={['CENTRAL']} />,
        children: [
          { path: '', element: <CentralHome /> },
          { path: 'locations/list', element: <CentralLocationsList /> },
          { path: 'locations/map', element: <CentralLocationsMap /> },
          { path: 'stock', element: <StockDashboard /> },
          { path: 'stock/categories', element: <StockCategories /> },
          { path: 'stock/products', element: <StockProducts /> },
          { path: 'stock/transactions', element: <StockTransactions /> },
          { path: 'branches-stock', element: <CentralBranchesStock /> },
          { path: 'branches-stock/:branchId', element: <CentralBranchStockDetail /> },
          { path: 'evacuees', element: <CentralEvacueesDashboard /> },
          { path: 'evacuees/branches', element: <CentralEvacueesBranches /> },
          { path: 'evacuees/directory', element: <CentralEvacueesDirectory /> },
          { path: 'evacuees/directory/:branchId', element: <CentralEvacueesList /> },
          { path: 'analytics/survival', element: <CentralSurvival /> },
          { path: 'analytics/stock-report', element: <CentralStockReport /> },
          { path: 'analytics/evacuee-report', element: <CentralEvacueeReport /> },
        ],
      },
      {
        path: '/branch',
        element: <ProtectedRoute allowedRoles={['BRANCH']} />,
        children: [
          { path: '', element: <BranchHome /> },
          { path: 'location', element: <BranchLocation /> },
          { path: 'stock', element: <StockDashboard /> },
          { path: 'stock/categories', element: <StockCategories /> },
          { path: 'stock/products', element: <StockProducts /> },
          { path: 'stock/transactions', element: <StockTransactions /> },
          { path: 'evacuees', element: <EvacueesDashboard /> },
          { path: 'evacuees/capacity', element: <EvacueesCapacity /> },
          { path: 'evacuees/check-in', element: <EvacueesCheckIn /> },
          { path: 'evacuees/check-out', element: <EvacueesCheckOut /> },
          { path: 'evacuees/history', element: <EvacueesHistory /> },
          { path: 'evacuees/list', element: <EvacueesList /> },
          { path: 'analytics/survival', element: <BranchSurvival /> },
          { path: 'analytics/stock-report', element: <BranchStockReport /> },
          { path: 'analytics/evacuee-report', element: <BranchEvacueeReport /> }
        ],
      },
      {
        path: '/profile',
        element: <ProtectedRoute />, // All authenticated users can access
        children: [{ path: '', element: <Profile /> }],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
