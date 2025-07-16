import Layout from '../../components/common/Layout';
import AdminDashboard from '../../components/admin/AdminDashboard';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import '../../styles/admin/AdminDashboard.css';

const AdminDashboardPage = () => {
  return (
    <ProtectedRoute>
      <Layout>
          <AdminDashboard />
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminDashboardPage;