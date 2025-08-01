import React from 'react';
import BookingComponent from '../../components/user/Booking'; // ✅ Ganti nama
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Layout from '../../components/common/Layout';

const BookingPage = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <BookingComponent />
      </Layout>
    </ProtectedRoute>
  );
};

export default BookingPage;