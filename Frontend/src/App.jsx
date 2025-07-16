import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import TrainManagementPage from './pages/admin/TrainManagementPage';

import TrainSchedulePage from './pages/admin/TrainSchedulePage';
import TrainManagementPage from './pages/admin/TrainManagementPage';


// User Pages
import UserDashboardPage from './pages/user/UserDashboard';
import ProfilePage from './pages/user/ProfilePage';

import './App.css';

const RoleBasedRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  // Tunggu loading selesai dulu
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Kalau belum login, redirect ke login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Kalau sudah login, redirect sesuai role
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/user/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/train-management" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TrainManagementPage />
                </ProtectedRoute>
              } 
            />


            <Route 
              path="/user/profile" 
              element={
                <ProtectedRoute allowedRoles={['user', 'visitor', 'admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/schedules" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TrainSchedulePage />
                </ProtectedRoute>
              } 
            />

            {/* Default Route with Role-based Redirect */}
            {/* ✅ Hapus ProtectedRoute wrapper */}
            <Route 
              path="/" 
              element={<RoleBasedRedirect />}
            />

            {/* User Dashboard */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['user', 'visitor', 'admin']}>
                  <UserDashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;