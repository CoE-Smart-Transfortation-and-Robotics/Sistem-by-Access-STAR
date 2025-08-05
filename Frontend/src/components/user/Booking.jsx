import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';

import axios from 'axios';

import '../../styles/user/Booking.css';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [allSchedules, setAllSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);

  const [selectedSeats, setSelectedSeats] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    sortBy: 'departure_time',
    trainClass: '',
    minPrice: '',
    maxPrice: '',
    departureTime: ''
  });

  // Multiple passengers data

  const [passengers, setPassengers] = useState([]);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  useEffect(() => {
    fetchStations();
    
    // Check if coming from dashboard with search data
    if (location.state?.searchData && location.state?.fromDashboard) {
      const { searchData } = location.state;
      setSearchForm(searchData);
      
      // Auto-execute search if all fields are filled
      if (searchData.origin_station && searchData.destination_station && searchData.travel_date) {
        setTimeout(() => {
          handleDashboardSearch(searchData);
        }, 500);
      }
    }
  }, [location]);

  const handleDashboardSearch = async (searchData) => {
    const params = {
      schedule_date: searchData.travel_date,
      origin_station_id: parseInt(searchData.origin_station),
      destination_station_id: parseInt(searchData.destination_station),
      train_category: 1
    };

    setLoading(true);
    try {
      const response = await apiService.searchTrainSchedules(params);
      const schedules = response?.data;
      if (Array.isArray(schedules) && schedules.length > 0) {
        setAllSchedules(schedules);
        setAvailableSchedules(schedules);
        setCurrentStep(2);
      } else {
        alert("Tidak ada jadwal tersedia untuk rute dan tanggal yang dipilih.");
      }
    } catch (error) {
      console.error("Error searching trains:", error);
      alert("Terjadi kesalahan saat mencari jadwal kereta.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    applyFilters({ ...filters, [name]: value });
  };

  const applyFilters = (currentFilters) => {
    let filtered = [...allSchedules];

    // Sort by
    if (currentFilters.sortBy === 'departure_time') {
      filtered.sort((a, b) => new Date(`2000-01-01 ${a.departure_time}`) - new Date(`2000-01-01 ${b.departure_time}`));
    } else if (currentFilters.sortBy === 'arrival_time') {
      filtered.sort((a, b) => new Date(`2000-01-01 ${a.arrival_time}`) - new Date(`2000-01-01 ${b.arrival_time}`));
    }

    // Filter by departure time
    if (currentFilters.departureTime) {
      const hour = parseInt(currentFilters.departureTime);
      filtered = filtered.filter(schedule => {
        const depHour = parseInt(schedule.departure_time?.split(':')[0] || 0);
        if (currentFilters.departureTime === 'morning') {
          return depHour >= 6 && depHour < 12;
        } else if (currentFilters.departureTime === 'afternoon') {
          return depHour >= 12 && depHour < 18;
        } else if (currentFilters.departureTime === 'evening') {
          return depHour >= 18 || depHour < 6;
        }
        return true;
      });
    }

    setAvailableSchedules(filtered);
  };

  const clearFilters = () => {
    const defaultFilters = {
      sortBy: 'departure_time',
      trainClass: '',
      minPrice: '',
      maxPrice: '',
      departureTime: ''
    };
    setFilters(defaultFilters);
    setAvailableSchedules(allSchedules);
  };

  const handlePassengerChange = (index, field, value) => {
    setPassengers(prev => prev.map((passenger, i) =>
      i === index ? { ...passenger, [field]: value } : passenger
    ));
  };

  const searchTrains = async (e) => {
    e.preventDefault();
    const { travel_date, origin_station, destination_station } = searchForm;


    // Validasi isi respons
    const schedules = response?.data;
    if (Array.isArray(schedules) && schedules.length > 0) {
      console.log("✅ Jadwal ditemukan:", schedules);
      setAllSchedules(schedules);
      setAvailableSchedules(schedules);
      setCurrentStep(2);
    } else {
      console.warn("⚠️ Tidak ada jadwal ditemukan atau response kosong.");
      alert("Tidak ada jadwal tersedia untuk rute dan tanggal yang dipilih.");

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
    setAllSchedules([]);
    setAvailableSeats([]);
    setPassengers([]);

    setFilters({
      sortBy: 'departure_time',
      trainClass: '',
      minPrice: '',
      maxPrice: '',
      departureTime: ''
    });

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

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Header */}
        <div className="booking-header">
          <h1>
            <span className="header-icon">🚂</span>
            Pemesanan Tiket Kereta
          </h1>
          <p>Nikmati perjalanan yang nyaman dan aman bersama KAI Access</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'inactive'}`}>
            <span className="progress-step-icon">🔍</span>
            Pencarian
          </div>
          <div className={`progress-connector ${currentStep > 1 ? 'completed' : ''}`}></div>
          <div className={`progress-step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'inactive'}`}>
            <span className="progress-step-icon">🚂</span>
            Pilih Kereta
          </div>
          <div className={`progress-connector ${currentStep > 2 ? 'completed' : ''}`}></div>
          <div className={`progress-step ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'inactive'}`}>
            <span className="progress-step-icon">💺</span>
            Pilih Kursi
          </div>
          <div className={`progress-connector ${currentStep > 3 ? 'completed' : ''}`}></div>
          <div className={`progress-step ${currentStep === 4 ? 'active' : 'inactive'}`}>
            <span className="progress-step-icon">👤</span>
            Data Penumpang
          </div>
        </div>

        {/* Step 1: Search */}
        {currentStep === 1 && (
          <div className="step-container">
            <div className="step-header">
              <div>
                <h2 className="step-title">
                  <span>🔍</span>
                  Cari Jadwal Kereta
                </h2>
                <p className="step-subtitle">Masukkan detail perjalanan Anda untuk mencari kereta yang tersedia</p>
              </div>
            </div>
            
            <form onSubmit={searchTrains} className="search-form">
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">🚉 Stasiun Asal</label>
                  <select
                    name="origin_station"
                    value={searchForm.origin_station}
                    onChange={handleSearchChange}
                    required
                    className="form-select"
                  >
                    <option value="">Pilih Stasiun Asal</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.station_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-field">
                  <label className="form-label">🎯 Stasiun Tujuan</label>
                  <select
                    name="destination_station"
                    value={searchForm.destination_station}
                    onChange={handleSearchChange}
                    required
                    className="form-select"
                  >
                    <option value="">Pilih Stasiun Tujuan</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.station_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">📅 Tanggal Keberangkatan</label>
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
                
                <div className="form-field">
                  <label className="form-label">👥 Jumlah Penumpang</label>
                  <select
                    name="passenger_count"
                    value={searchForm.passenger_count}
                    onChange={handleSearchChange}
                    className="form-select"
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} Penumpang</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="search-btn"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Mencari...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Cari Kereta
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Select Train */}
        {currentStep === 2 && (
          <div className="step-container">
            <div className="step-header">
              <div>
                <h2 className="step-title">
                  <span>🚂</span>
                  Pilih Jadwal Kereta
                </h2>
                <p className="step-subtitle">Pilih kereta yang sesuai dengan jadwal perjalanan Anda</p>
              </div>
              <button onClick={() => setCurrentStep(1)} className="back-btn">
                <span>←</span>
                Kembali
              </button>
            </div>

            {/* Route Info */}
            <div className="route-info">
              <div className="route-display">
                <span>{getStationName(searchForm.origin_station)}</span>
                <span className="route-arrow">→</span>
                <span>{getStationName(searchForm.destination_station)}</span>
                <span style={{marginLeft: '2rem', opacity: 0.8}}>📅 {searchForm.travel_date}</span>
              </div>
            </div>

            {/* Filters */}
            <div className="filter-section">
              <div className="filter-header">
                <h3 className="filter-title">
                  <span>🔧</span>
                  Filter & Urutkan
                </h3>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Hapus Filter
                </button>
              </div>
              
              <div className="filter-grid">
                <div className="filter-field">
                  <label>Urutkan Berdasarkan</label>
                  <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                    <option value="departure_time">Waktu Keberangkatan</option>
                    <option value="arrival_time">Waktu Kedatangan</option>
                  </select>
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
                
                <div className="filter-field">
                  <label>Waktu Keberangkatan</label>
                  <select name="departureTime" value={filters.departureTime} onChange={handleFilterChange}>
                    <option value="">Semua Waktu</option>
                    <option value="morning">Pagi (06:00 - 12:00)</option>
                    <option value="afternoon">Siang (12:00 - 18:00)</option>
                    <option value="evening">Malam (18:00 - 06:00)</option>
                  </select>
                </div>
              </div>
            </div>


            {availableSchedules.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🚫</div>
                <h3>Tidak Ada Kereta Ditemukan</h3>
                <p>Maaf, tidak ada jadwal kereta yang tersedia untuk rute dan tanggal yang Anda pilih.</p>
                <button onClick={() => setCurrentStep(1)} className="try-again-btn">
                  Coba Pencarian Lain
                </button>
              </div>
            ) : (
              <div className="trains-grid">
                {availableSchedules.map(schedule => (
                  <div key={schedule.schedule_id} className="train-card">
                    <div className="train-header">
                      <div className="train-info">
                        <h3 className="train-name">🚂 Kereta {schedule.train_id}</h3>
                        <div className="train-details">
                          <div className="detail-item">
                            <span className="detail-label">Tanggal</span>
                            <span className="detail-value">{schedule.schedule_date}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Keberangkatan</span>
                            <span className="detail-value">{schedule.departure_time || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Kedatangan</span>
                            <span className="detail-value">{schedule.arrival_time || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Estimasi Waktu</span>
                            <span className="detail-value">
                              {schedule.departure_time && schedule.arrival_time ? 
                                `${Math.round((new Date(`2000-01-01 ${schedule.arrival_time}`) - new Date(`2000-01-01 ${schedule.departure_time}`)) / (1000 * 60 * 60))} jam` 
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => selectSchedule(schedule)}
                        className="select-train-btn"
                      >
                        <span>✓</span>
                        Pilih Kereta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Step 3: Seat Selection */}
        {currentStep === 3 && (

          <div className="step-container">
            <div className="step-header">
              <div>
                <h2 className="step-title">
                  <span>💺</span>
                  Pilih Kursi untuk {searchForm.passenger_count} Penumpang
                </h2>
                <p className="step-subtitle">Pilih kursi yang nyaman untuk perjalanan Anda</p>

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
              <button onClick={() => setCurrentStep(2)} className="back-btn">
                <span>←</span>
                Kembali
              </button>
            </div>


            <div className="seat-selection-container">
              {/* Passengers Overview */}
              <div className="passengers-overview">
                <h3>📋 Status Pemilihan Kursi</h3>
                <div className="passengers-grid">
                  {passengers.map((passenger, index) => (
                    <div key={`passenger-overview-${index}`} className={`passenger-card ${passenger.seat_id ? 'has-seat' : ''}`}>
                      <div className="passenger-number">👤 Penumpang {index + 1}</div>
                      <div className={`seat-assignment ${passenger.seat_id ? 'assigned' : ''}`}>
                        {passenger.seat_id ? 
                          `Kursi: ${getSeatInfo(passenger.seat_id)?.seat_number}` : 
                          'Belum memilih kursi'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passenger Selection */}
              <div className="passenger-selection">
                <h4>Pilih penumpang untuk memilih kursi:</h4>
                <div className="passenger-buttons">
                  {passengers.map((passenger, index) => (
                    <button
                      key={`passenger-btn-${index}`}
                      type="button"
                      onClick={() => setActivePassengerIndex(index)}
                      className={`passenger-btn ${activePassengerIndex === index ? 'active' : ''}`}
                    >
                      👤 Penumpang {index + 1}
                      {passenger.seat_id && (
                        <span style={{display: 'block', fontSize: '0.75rem', opacity: 0.8}}>
                          Kursi: {getSeatInfo(passenger.seat_id)?.seat_number}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seat Map */}
              <div className="seat-map-container">
                <div className="seat-map-header">
                  <h3 className="seat-map-title">🚂 Peta Kursi Kereta</h3>
                  
                  <div className="seat-legend">
                    <div className="legend-item">
                      <div className="legend-color available"></div>
                      <span>Tersedia</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color selected"></div>
                      <span>Dipilih Saat Ini</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color assigned"></div>
                      <span>Dipilih Penumpang Lain</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color booked"></div>
                      <span>Sudah Dipesan</span>
                    </div>
                  </div>
                </div>

                <div className="seat-grid">
                  {availableSeats.slice(0, 20).map((seat, index) => {
                    const seatId = seat.seat_id;
                    const isSelectedByCurrentPassenger = passengers[activePassengerIndex]?.seat_id === seatId;
                    const isSelectedByOtherPassenger = passengers.some((p, pIndex) => p.seat_id === seatId && pIndex !== activePassengerIndex);
                    const isBooked = seat.isBooked;
                    
                    let seatClass = 'seat-btn available';
                    if (isBooked) {
                      seatClass = 'seat-btn booked';
                    } else if (isSelectedByCurrentPassenger) {
                      seatClass = 'seat-btn selected';
                    } else if (isSelectedByOtherPassenger) {
                      seatClass = 'seat-btn assigned';
                    }
                    
                    return (
                      <button
                        key={`seat-${seatId}-${index}`}
                        onClick={() => {
                          if (!isBooked && !loading && activePassengerIndex !== null) {
                            toggleSeatSelection(seat, activePassengerIndex);
                          }
                        }}
                        disabled={isBooked || loading || activePassengerIndex === null}
                        className={seatClass}
                      >
                        {seat.seat_number}
                      </button>
                    );
                  })}
                </div>
                
                {activePassengerIndex === null && (
                  <p style={{ textAlign: 'center', color: '#dc2626', marginTop: '1rem', fontWeight: '600' }}>
                    ⚠️ Pilih penumpang terlebih dahulu, lalu klik kursi yang diinginkan
                  </p>
                )}
              </div>

              <button
                onClick={proceedToPassengerDetails}
                disabled={passengers.filter(p => p.seat_id).length !== parseInt(searchForm.passenger_count)}
                className="continue-btn"
              >
                <span>✓</span>
                Lanjut ke Data Penumpang
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Passenger Details */}
        {currentStep === 4 && (
          <div className="step-container">
            <div className="step-header">
              <div>
                <h2 className="step-title">
                  <span>👤</span>
                  Lengkapi Data Penumpang
                </h2>
                <p className="step-subtitle">Masukkan data lengkap setiap penumpang sesuai identitas resmi</p>
              </div>
              <button onClick={() => setCurrentStep(3)} className="back-btn">
                <span>←</span>
                Kembali
              </button>
            </div>

            <form onSubmit={submitBooking}>
              <div className="passenger-details-grid">
                {passengers.map((passenger, index) => (
                  <div key={`passenger-detail-${index}`} className="passenger-detail-card">
                    <div className="passenger-detail-header">
                      <h3 className="passenger-detail-title">
                        👤 Penumpang {index + 1}
                      </h3>
                      <div className="seat-info-badge">
                        💺 Kursi {getSeatInfo(passenger.seat_id)?.seat_number}
                      </div>
                    </div>
                    
                    <div className="detail-form-grid">
                      <div className="detail-form-field">
                        <label>📝 Nama Lengkap</label>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          required
                          placeholder="Masukkan nama lengkap sesuai KTP"
                        />
                      </div>

                      <div className="detail-form-field">
                        <label>🆔 Nomor NIK (KTP)</label>
                        <input
                          type="text"
                          value={passenger.nik}
                          onChange={(e) => handlePassengerChange(index, 'nik', e.target.value)}
                          required
                          maxLength="16"
                          placeholder="Masukkan 16 digit NIK"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetBooking}
                  className="reset-btn"
                >
                  🔄 Mulai Ulang
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      Konfirmasi Pemesanan
                    </>
                  )}
                </button>
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