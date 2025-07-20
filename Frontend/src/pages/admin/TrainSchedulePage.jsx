import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import TrainScheduleManagement from '../../components/admin/TrainScheduleManagement';

const TrainSchedulePage = () => {
  console.log(' TrainSchedulePage rendering...'); // ← Debug log
  
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div style={{ padding: '2rem', backgroundColor: '#f0f0f0' }}>
          <h1> Train Schedule Page Test</h1>
          <TrainScheduleManagement />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default TrainSchedulePage;
