import { useAuth } from '../../hooks/useAuth';
import BookingCard from './BookingCard';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="user-dashboard">
      <div className="welcome-section">
        <h2>Welcome back, {user?.name}!</h2>
        <p>Your role: <span className={`role-badge role-${user?.role}`}>{user?.role}</span></p>
      </div>

      {user?.role === 'user' && (
        <div className="user-features">
          <h3>Quick Actions</h3>
          <div className="feature-grid">
            <BookingCard 
              title="Book Train Ticket"
              description="Find and book your train journey"
              action="book-ticket"
            />
            <BookingCard 
              title="My Bookings"
              description="View your booking history"
              action="view-bookings"
            />
            <BookingCard 
              title="Train Schedule"
              description="Check train schedules and routes"
              action="view-schedule"
            />
          </div>
        </div>
      )}

      {user?.role === 'visitor' && (
        <div className="visitor-info">
          <h3>Visitor Access</h3>
          <p>You have limited access. Please contact admin to upgrade your account.</p>
          <div className="upgrade-section">
            <h4>Available Features:</h4>
            <ul>
              <li>View train schedules</li>
              <li>Check routes information</li>
              <li>Contact customer service</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;