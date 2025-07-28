import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import '../../styles/user/Booking.css';

const BookingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [trainCategories, setTrainCategories] = useState([]);
  const [searchForm, setSearchForm] = useState({
    origin_station: '',
    destination_station: '',
    travel_date: '',
    passenger_count: 1,
    train_category: '',
  });

  const [stations, setStations] = useState([]);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    const passengerCount = parseInt(searchForm.passenger_count);
    const newPassengers = Array.from({ length: passengerCount }, (_, index) => ({
      name: '',
      nik: '',
      seat_id: null
    }));
    setPassengers(newPassengers);
    setActivePassengerIndex(0);
  }, [searchForm.passenger_count]);

  useEffect(() => {
    apiService.getAllTrainCategories()
      .then(res => {
        const categories = Array.isArray(res) ? res : res?.data || [];
        setTrainCategories(categories);
      })
      .catch(() => setTrainCategories([]));
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllStations();
      setStations(data || []);
    } catch (error) {
      setError('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handlePassengerChange = (index, field, value) => {
    setPassengers(prev => prev.map((passenger, i) =>
      i === index ? { ...passenger, [field]: value } : passenger
    ));
  };

  const searchTrains = async (e) => {
    e.preventDefault();
    const { travel_date, origin_station, destination_station } = searchForm;

    if (!travel_date || !origin_station || !destination_station) {
      setError("Please fill in all required fields (origin, destination, date)");
      return;
    }
    if (origin_station === destination_station) {
      setError("Origin and destination must be different");
      return;
    }

    const params = {
      schedule_date: searchForm.travel_date,
      origin_station_id: parseInt(searchForm.origin_station),
      destination_station_id: parseInt(searchForm.destination_station),
      train_category: searchForm.train_category ? parseInt(searchForm.train_category) : undefined,
    };

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.searchTrainSchedules(params);
      const schedules = response?.data || [];
      if (schedules.length > 0) {
        setAvailableSchedules(schedules);
        setCurrentStep(2);
      } else {
        setError("No trains found for your criteria");
        setAvailableSchedules([]);
      }
    } catch (error) {
      setError(error?.message || "Failed to search trains");
    } finally {
      setLoading(false);
    }
  };

  const selectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setLoading(true);
    setError(null);

    try {
      const trainId = schedule.train?.train_id || schedule.train_id;
      const scheduleDate = schedule.timing?.schedule_date || schedule.schedule_date;

      const response = await apiService.getAvailableSeats({
        train_id: trainId,
        schedule_date: scheduleDate,
        origin_station_id: searchForm.origin_station,
        destination_station_id: searchForm.destination_station
      });

      const seatsData = response || [];
      const formattedSeats = seatsData.map(seat => ({
        seat_id: seat.seat_id,
        seat_number: seat.seat_number,
        carriage_id: seat.carriage_id,
        class: seat.class,
        isBooked: seat.is_booked
      }));

      setAvailableSeats(formattedSeats);
      setCurrentStep(3);
    } catch (error) {
      setError("Failed to load available seats");
      // Fallback sample seats
      const sampleSeats = Array.from({ length: 20 }, (_, i) => ({
        seat_id: i + 1,
        seat_number: `${Math.ceil((i + 1) / 4)}${String.fromCharCode(65 + (i % 4))}`,
        carriage_id: 1,
        class: 'Economy',
        isBooked: [2, 5, 8, 12, 15].includes(i + 1)
      }));
      setAvailableSeats(sampleSeats);
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatSelection = (seat, passengerIndex) => {
    if (seat.isBooked) return;
    const seatId = seat.seat_id;
    setPassengers(prev => prev.map((passenger, i) => {
      if (passenger.seat_id === seatId) {
        return { ...passenger, seat_id: null };
      }
      if (i === passengerIndex) {
        return { ...passenger, seat_id: passenger.seat_id === seatId ? null : seatId };
      }
      return passenger;
    }));
  };

  const proceedToPassengerDetails = () => {
    const selectedSeatCount = passengers.filter(p => p.seat_id).length;
    if (selectedSeatCount !== parseInt(searchForm.passenger_count)) {
      setError(`Please select exactly ${searchForm.passenger_count} seat(s)`);
      return;
    }
    setError(null);
    setCurrentStep(4);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedSchedule) throw new Error("Schedule not selected");
      const trainId = selectedSchedule.train?.train_id || selectedSchedule.train_id;
      const scheduleDate = selectedSchedule.timing?.schedule_date || selectedSchedule.schedule_date;
      if (!trainId || !scheduleDate) throw new Error("Invalid schedule data");

      for (let i = 0; i < passengers.length; i++) {
        const passenger = passengers[i];
        if (!passenger.name.trim()) throw new Error(`Please enter name for Passenger ${i + 1}`);
        if (!passenger.nik || passenger.nik.length !== 16) throw new Error(`Please enter valid 16-digit NIK for Passenger ${i + 1}`);
        if (!passenger.seat_id) throw new Error(`Please select seat for Passenger ${i + 1}`);
      }

      const bookingPayload = {
        train_id: trainId,
        schedule_date: scheduleDate,
        origin_station_id: Number(searchForm.origin_station),
        destination_station_id: Number(searchForm.destination_station),
        passengers: passengers.map(p => ({
          seat_id: p.seat_id,
          name: p.name.trim(),
          nik: p.nik,
        })),
      };

      const response = await apiService.createBooking(bookingPayload);
      alert(`Booking created successfully! Booking ID: ${response.data?.booking_id || 'N/A'}`);
      navigate('/bookinghistory');
    } catch (error) {
      setError(error.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedSchedule(null);
    setAvailableSchedules([]);
    setAvailableSeats([]);
    setPassengers([]);
    setError(null);
    setSearchForm({
      origin_station: '',
      destination_station: '',
      travel_date: '',
      passenger_count: 1,
      train_category: ''
    });
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === parseInt(stationId));
    return station ? station.station_name : 'Unknown Station';
  };

  const getSeatInfo = (seatId) => {
    return availableSeats.find(s => s.seat_id === seatId) || null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && currentStep === 1) {
    return (
      <div className="booking-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading booking system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>🚂 Train Booking System</h1>
          <p>Book your train journey in simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="booking-progress">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Search</span>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Select Train</span>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <span>Choose Seats</span>
          </div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <span>Passenger Info</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        {/* Step 1: Search Form */}
        {currentStep === 1 && (
          <div className="booking-card">
            <div className="card-header">
              <h3>🔍 Search Trains</h3>
              <p>Find available trains for your journey</p>
            </div>
            <form onSubmit={searchTrains} className="search-form">
              <div className="form-row">
                <div className="form-group">
                  <label>📍 From</label>
                  <select
                    name="origin_station"
                    value={searchForm.origin_station}
                    onChange={handleSearchChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select Origin Station</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.station_name} ({station.station_code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>🏁 To</label>
                  <select
                    name="destination_station"
                    value={searchForm.destination_station}
                    onChange={handleSearchChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select Destination Station</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.station_name} ({station.station_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>📅 Travel Date</label>
                  <input
                    type="date"
                    name="travel_date"
                    value={searchForm.travel_date}
                    onChange={handleSearchChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>👥 Passengers</label>
                  <select
                    name="passenger_count"
                    value={searchForm.passenger_count}
                    onChange={handleSearchChange}
                    className="form-select"
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>🚆 Train Category</label>
                  <select
                    name="train_category"
                    value={searchForm.train_category}
                    onChange={handleSearchChange}
                    className="form-select"
                  >
                    <option value="">All Categories</option>
                    {trainCategories.map(cat => (
                      <option key={cat.train_category_id || cat.id} value={cat.train_category_id || cat.id}>
                        {cat.category_name || cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    🔍 Search Trains
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Train Selection */}
        {currentStep === 2 && (
          <div className="booking-card">
            <div className="card-header">
              <h3>🚂 Available Trains</h3>
              <p>
                {getStationName(searchForm.origin_station)} → {getStationName(searchForm.destination_station)}
                | {formatDate(searchForm.travel_date)}
              </p>
              <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
                ← Back to Search
              </button>
            </div>
            <div className="trains-list">
              {availableSchedules.map(schedule => (
                <div key={schedule.schedule_id} className="train-card">
                  <div className="train-info">
                    <h4>
                      🚂 {schedule.train?.train_name || schedule.train_name} ({schedule.train?.train_code || schedule.train_code})
                    </h4>
                    <p className="train-category">
                      <b>Category:</b> {schedule.train?.category || schedule.category}
                    </p>
                    <p className="train-date">
                      <b>Date:</b> {formatDate(schedule.timing?.schedule_date || schedule.schedule_date)}
                    </p>
                    <div className="train-route">
                      <span>{schedule.route?.origin_station || getStationName(searchForm.origin_station)}</span>
                      <span className="route-arrow">→</span>
                      <span>{schedule.route?.destination_station || getStationName(searchForm.destination_station)}</span>
                    </div>
                    <div className="train-time">
                      <span><b>Departure:</b> {schedule.timing?.departure_time}</span>
                      <span style={{ marginLeft: '1rem' }}><b>Arrival:</b> {schedule.timing?.arrival_time}</span>
                    </div>
                    <div className="train-classes">
                      <b>Seat Classes:</b>
                      {schedule.seat_classes && Object.entries(schedule.seat_classes).map(([cls, qty]) => (
                        <span key={cls} style={{ marginLeft: '0.5rem' }}>
                          {cls}: {qty} seat(s)
                        </span>
                      ))}
                    </div>
                    <div className="train-pricing">
                      <b>Pricing:</b>
                      {schedule.pricing && Object.entries(schedule.pricing).map(([cls, price]) => (
                        <span key={cls} style={{ marginLeft: '0.5rem' }}>
                          {cls}: Rp{price.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => selectSchedule(schedule)}
                    disabled={loading}
                    className="btn btn-success"
                  >
                    {loading ? 'Loading...' : 'Select Train'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Seat Selection */}
        {currentStep === 3 && (
          <div className="booking-card">
            <div className="card-header">
              <h3>💺 Select Seats</h3>
              <p>Choose {searchForm.passenger_count} seat{searchForm.passenger_count > 1 ? 's' : ''} for your journey</p>
              <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
                ← Back to Trains
              </button>
            </div>
            <div className="passengers-status">
              {passengers.map((passenger, index) => (
                <div key={index} className="passenger-status">
                  <span className="passenger-label">Passenger {index + 1}</span>
                  <span className="seat-status">
                    {passenger.seat_id ? `💺 ${getSeatInfo(passenger.seat_id)?.seat_number}` : '❌ No seat'}
                  </span>
                </div>
              ))}
            </div>
            <div className="passenger-selector">
              <h4>👤 Select Passenger to Assign Seat:</h4>
              <div className="passenger-buttons">
                {passengers.map((passenger, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActivePassengerIndex(index)}
                    className={`passenger-btn ${activePassengerIndex === index ? 'active' : ''}`}
                  >
                    <span>Passenger {index + 1}</span>
                    {passenger.seat_id && (
                      <span className="assigned-seat">
                        {getSeatInfo(passenger.seat_id)?.seat_number}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="seat-map">
              <h4>💺 Seat Map</h4>
              <div className="seat-legend">
                <div className="legend-item">
                  <div className="seat-demo available"></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="seat-demo selected"></div>
                  <span>Your Selection</span>
                </div>
                <div className="legend-item">
                  <div className="seat-demo assigned"></div>
                  <span>Assigned to Others</span>
                </div>
                <div className="legend-item">
                  <div className="seat-demo booked"></div>
                  <span>Booked</span>
                </div>
              </div>
              <div className="seats-grid">
                {availableSeats.slice(0, 20).map((seat) => {
                  const seatId = seat.seat_id;
                  const isSelectedByCurrentPassenger = passengers[activePassengerIndex]?.seat_id === seatId;
                  const isSelectedByOtherPassenger = passengers.some((p, pIndex) =>
                    p.seat_id === seatId && pIndex !== activePassengerIndex
                  );
                  const isBooked = seat.isBooked;
                  let seatClass = 'seat';
                  if (isBooked) seatClass += ' booked';
                  else if (isSelectedByCurrentPassenger) seatClass += ' selected';
                  else if (isSelectedByOtherPassenger) seatClass += ' assigned';
                  else seatClass += ' available';
                  return (
                    <button
                      key={seatId}
                      onClick={() => !isBooked && toggleSeatSelection(seat, activePassengerIndex)}
                      disabled={isBooked || loading}
                      className={seatClass}
                      title={`Seat ${seat.seat_number} - ${seat.class}`}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={proceedToPassengerDetails}
              disabled={passengers.filter(p => p.seat_id).length !== parseInt(searchForm.passenger_count)}
              className="btn btn-primary"
            >
              Continue to Passenger Details →
            </button>
          </div>
        )}

        {/* Step 4: Passenger Details */}
        {currentStep === 4 && (
          <div className="booking-card">
            <div className="card-header">
              <h3>👤 Passenger Information</h3>
              <p>Enter details for all passengers</p>
              <button onClick={() => setCurrentStep(3)} className="btn btn-secondary">
                ← Back to Seat Selection
              </button>
            </div>
            <form onSubmit={submitBooking} className="passenger-form">
              {passengers.map((passenger, index) => (
                <div key={index} className="passenger-details">
                  <div className="passenger-header">
                    <h4>Passenger {index + 1}</h4>
                    <span className="seat-info">
                      💺 Seat {getSeatInfo(passenger.seat_id)?.seat_number}
                    </span>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        required
                        className="form-input"
                        placeholder="Enter full name as in ID"
                      />
                    </div>
                    <div className="form-group">
                      <label>NIK (Identity Number) *</label>
                      <input
                        type="text"
                        value={passenger.nik}
                        onChange={(e) => handlePassengerChange(index, 'nik', e.target.value)}
                        required
                        maxLength="16"
                        pattern="[0-9]{16}"
                        className="form-input"
                        placeholder="16-digit NIK number"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="form-actions">
                <button type="button" onClick={resetBooking} className="btn btn-secondary">
                  🔄 Start Over
                </button>
                <button type="submit" disabled={loading} className="btn btn-success">
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Creating Booking...
                    </>
                  ) : (
                    '✅ Confirm Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;