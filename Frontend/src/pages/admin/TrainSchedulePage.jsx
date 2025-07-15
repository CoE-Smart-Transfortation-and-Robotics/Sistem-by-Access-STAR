import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';

const TrainSchedulePage = () => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        {/* Train Schedule Management Page Content */}
      </Layout>
    </ProtectedRoute>
  );
};

export default TrainSchedulePage;
