import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public Pages
import LandingPage from './pages/LandingPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import TrainManagementPage from './pages/admin/TrainManagementPage';
import RouteManagementPage from './pages/admin/RouteManagementPage';
import TrainSchedulePage from './pages/admin/TrainSchedulePage';

// User Pages
import UserDashboardPage from './pages/user/UserDashboard';
import ProfilePage from './pages/user/ProfilePage';
import BookingPage from './pages/user/BookingPage';
import BookingHistoryPage from './pages/user/BookingHistoryPage';  // ✅ Import BookingPage

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* ✅ Tambahkan route booking */}
      <Route 
        path="/booking" 
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/bookinghistory" 
        element={
          <ProtectedRoute>
            <BookingHistoryPage />
          </ProtectedRoute>
        } 
      />

      {/* User Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requiredRole="admin">
            <UserManagementPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/trains" 
        element={
          <ProtectedRoute requiredRole="admin">
            <TrainManagementPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/routes" 
        element={
          <ProtectedRoute requiredRole="admin">
            <RouteManagementPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/schedules" 
        element={
          <ProtectedRoute requiredRole="admin">
            <TrainSchedulePage />
          </ProtectedRoute>
        } 
      />

      {/* Catch all - redirect to appropriate dashboard */}
      <Route 
        path="*" 
        element={
          user ? (
            user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;