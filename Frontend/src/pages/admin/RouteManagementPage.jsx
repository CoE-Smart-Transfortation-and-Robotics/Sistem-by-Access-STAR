import Layout from '../../components/common/Layout';
import RouteManagement from '../../components/admin/RouteManagement';
import ProtectedRoute from '../../components/common/ProtectedRoute';

const RouteManagementPage = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <RouteManagement />
      </Layout>
    </ProtectedRoute>
  );
};

export default RouteManagementPage;