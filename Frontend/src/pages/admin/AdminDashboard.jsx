import Layout from '../../components/common/Layout';
import AdminStats from '../../components/admin/AdminStats';
import ProtectedRoute from '../../components/common/ProtectedRoute';

const AdminDashboard = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <Layout>
        <div className="admin-dashboard">
          <h1>Admin Dashboard</h1>
          <AdminStats />
          
          <div className="admin-actions">
            <h3>Quick Actions</h3>
            <div className="action-grid">
              <div className="action-card" onClick={() => window.location.href = '/admin/users'}>
                <h4>Manage Users</h4>
                <p>Add, edit, or remove system users</p>
              </div>
              <div className="action-card">
                <h4>Train Management</h4>
                <p>Manage trains and schedules</p>
              </div>
              <div className="action-card">
                <h4>Booking Reports</h4>
                <p>View booking statistics and reports</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;