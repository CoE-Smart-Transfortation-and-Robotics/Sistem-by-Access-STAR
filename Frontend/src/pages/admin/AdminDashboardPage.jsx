import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import AdminDashboard from '../../components/admin/AdminDashboard';
import ProtectedRoute from '../../components/common/ProtectedRoute';


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