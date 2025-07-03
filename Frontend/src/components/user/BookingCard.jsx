const BookingCard = ({ title, description, action }) => {
  const handleClick = () => {
    switch (action) {
      case 'book-ticket':
        console.log('Navigate to booking page');
        break;
      case 'view-bookings':
        console.log('Navigate to bookings page');
        break;
      case 'view-schedule':
        console.log('Navigate to schedule page');
        break;
      default:
        console.log('Unknown action');
    }
  };

  return (
    <div className="booking-card" onClick={handleClick}>
      <h4>{title}</h4>
      <p>{description}</p>
      <button className="card-button">
        Get Started
      </button>
    </div>
  );
};

export default BookingCard;