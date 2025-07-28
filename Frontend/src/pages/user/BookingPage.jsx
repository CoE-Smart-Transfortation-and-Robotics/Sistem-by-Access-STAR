import React from 'react';
import Layout from '../../components/common/Layout';
import BookingComponent from '../../components/user/Booking';
import ProtectedRoute from '../../components/common/ProtectedRoute';

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