import Layout from '../../components/common/Layout';
import UserManagement from '../../components/admin/UserManagement';
import ProtectedRoute from '../../components/common/ProtectedRoute';

const UserManagementPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <Layout>
        <UserManagement />
      </Layout>
    </ProtectedRoute>
  );
};

export default UserManagementPage;