import Layout from '../../components/common/Layout';
import BookingHistory from '../../components/user/BookingHistory';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import '../../styles/user/ProfileForm.css';

const BookingHistoryPage = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <BookingHistory />
      </Layout>
    </ProtectedRoute>
  );
};

export default BookingHistoryPage;