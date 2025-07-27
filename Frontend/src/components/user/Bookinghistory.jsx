import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../../styles/user/BookingHistory.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getMyBookings();
      console.log('Bookings response:', response); // Debug log
      
      setBookings(response || []);
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      
      let errorMessage = 'Failed to load booking history';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Error ${error.response.status}`;
      } else if (error.message?.includes('Unexpected token')) {
        errorMessage = 'Server error: Booking history endpoint not found';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingBookingId(bookingId);
      
        console.log('Attempting to cancel booking:', bookingId);
        console.log('API base URL:', apiService.baseURL || 'localhost:9000/api');
        
        const response = await apiService.cancelBooking(bookingId);
        console.log('Cancel response:', response);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      
      alert('Booking cancelled successfully!');
      setShowCancelModal(false);
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      // Handle different types of errors
      let errorMessage = 'Failed to cancel booking';
      
      if (error.response) {
        // API responded with error status
        errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.message?.includes('Unexpected token')) {
        // Server returned HTML instead of JSON (likely 404 or 500 error)
        errorMessage = 'Server error: Cancel booking endpoint not found or misconfigured';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      
    } finally {
      setCancellingBookingId(null);
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setSelectedBooking(null);
    setShowCancelModal(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancelBooking = (booking) => {
    if (booking.status?.toLowerCase() === 'cancelled') return false;
    
    // Check if booking is within 2 hours of departure
    const now = new Date();
    const scheduleDate = new Date(booking.TrainSchedule?.schedule_date);
    const timeDiff = scheduleDate - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff > 2; // Can cancel if more than 2 hours before departure
  };

  if (loading) {
    return (
      <div className="booking-history">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your booking history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-history">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Bookings</h3>
          <p>{error}</p>
          <button onClick={fetchBookings} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-history">
      <div className="history-header">
        <h2>🎫 Booking History</h2>
        <p>Track and manage all your train reservations</p>
        <button onClick={fetchBookings} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">📋</div>
          <h3>No Bookings Found</h3>
          <p>You haven't made any train reservations yet.</p>
          <button 
            onClick={() => window.location.href = '/booking'} 
            className="book-now-btn"
          >
            Book Your First Trip
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-info">
                  <h3>Booking #{booking.id}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>
                <div className="booking-price">
                  {formatPrice(booking.price)}
                </div>
              </div>

              <div className="booking-details">
                <div className="train-info">
                  <div className="train-name">
                    🚂 {booking.TrainSchedule?.Train?.train_name || 'Unknown Train'}
                    <span className="train-code">
                      ({booking.TrainSchedule?.Train?.train_code || 'N/A'})
                    </span>
                  </div>
                  <div className="schedule-date">
                    📅 {formatDate(booking.TrainSchedule?.schedule_date)}
                  </div>
                </div>

                <div className="route-info">
                  <div className="route">
                    <span className="station">
                      📍 {booking.OriginStation?.station_name || 'Unknown'}
                    </span>
                    <span className="arrow">→</span>
                    <span className="station">
                      🏁 {booking.DestinationStation?.station_name || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="passengers-info">
                  <h4>Passengers ({booking.passengers?.length || 0})</h4>
                  <div className="passengers-list">
                    {booking.passengers?.map((passenger, index) => (
                      <div key={index} className="passenger-item">
                        <span className="passenger-name">👤 {passenger.name}</span>
                        <span className="seat-number">💺 Seat {passenger.seat_id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="booking-meta">
                  <div className="booking-date">
                    Booked: {formatDateTime(booking.booking_date)}
                  </div>
                  {booking.updated_at !== booking.created_at && (
                    <div className="updated-date">
                      Updated: {formatDateTime(booking.updated_at)}
                    </div>
                  )}
                </div>
              </div>

              <div className="booking-actions">
                {canCancelBooking(booking) && (
                  <button
                    onClick={() => openCancelModal(booking)}
                    className="cancel-btn"
                    disabled={cancellingBookingId === booking.id}
                  >
                    {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
                <button className="details-btn">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="cancel-modal">
            <div className="modal-header">
              <h3>Cancel Booking</h3>
              <button onClick={closeCancelModal} className="close-modal-btn">×</button>
            </div>
            
            <div className="modal-content">
              <div className="warning-icon">⚠️</div>
              <h4>Are you sure you want to cancel this booking?</h4>
              
              <div className="booking-summary">
                <p><strong>Booking ID:</strong> #{selectedBooking.id}</p>
                <p><strong>Train:</strong> {selectedBooking.TrainSchedule?.Train?.train_name}</p>
                <p><strong>Date:</strong> {formatDate(selectedBooking.TrainSchedule?.schedule_date)}</p>
                <p><strong>Route:</strong> {selectedBooking.OriginStation?.station_name} → {selectedBooking.DestinationStation?.station_name}</p>
                <p><strong>Amount:</strong> {formatPrice(selectedBooking.price)}</p>
              </div>
              
              <p className="cancellation-note">
                <strong>Note:</strong> Cancellation is only allowed up to 2 hours before departure time.
              </p>
            </div>
            
            <div className="modal-actions">
              <button onClick={closeCancelModal} className="keep-booking-btn">
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(selectedBooking.id)}
                className="confirm-cancel-btn"
                disabled={cancellingBookingId === selectedBooking.id}
              >
                {cancellingBookingId === selectedBooking.id ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;