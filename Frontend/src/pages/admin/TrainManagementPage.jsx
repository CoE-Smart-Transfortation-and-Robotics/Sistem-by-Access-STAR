import Layout from '../../components/common/Layout';
import TrainManagement from '../../components/admin/TrainManagement';
import ProtectedRoute from '../../components/common/ProtectedRoute';

const TrainManagementPage = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <TrainManagement />
      </Layout>
    </ProtectedRoute>
  );
};

export default TrainManagementPage;