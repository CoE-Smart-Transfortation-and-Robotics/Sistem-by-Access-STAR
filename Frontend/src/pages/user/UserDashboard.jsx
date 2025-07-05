import Layout from '../../components/common/Layout';
import UserDashboard from '../../components/user/UserDashboard';
import ProtectedRoute from '../../components/common/ProtectedRoute';

const UserDashboardPage = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <UserDashboard />
      </Layout>
    </ProtectedRoute>
  );
};

export default UserDashboardPage;