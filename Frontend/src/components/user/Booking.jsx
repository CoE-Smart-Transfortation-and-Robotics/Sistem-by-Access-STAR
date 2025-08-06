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
  
  const [searchForm, setSearchForm] = useState({
    origin_station: '',
    destination_station: '',
    travel_date: '',
    passenger_count: 1
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
  const [activePassengerIndex, setActivePassengerIndex] = useState(null);

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

    console.log("🚀 Dashboard search params:", params);
    setLoading(true);
    try {
      const response = await apiService.searchTrainSchedules(params);
      
      console.log("🔍 Dashboard API Response:", response);
      
      // ✅ Handle multiple possible response formats
      let schedules;
      if (Array.isArray(response)) {
        schedules = response;
      } else if (response?.data && Array.isArray(response.data)) {
        schedules = response.data;
      } else if (response?.schedules && Array.isArray(response.schedules)) {
        schedules = response.schedules;
      } else if (response?.results && Array.isArray(response.results)) {
        schedules = response.results;
      } else {
        schedules = [];
      }

      if (Array.isArray(schedules) && schedules.length > 0) {
        setAllSchedules(schedules);
        setAvailableSchedules(schedules);
        setCurrentStep(2);
      } else {
        alert("Tidak ada jadwal tersedia untuk rute dan tanggal yang dipilih.");
      }
    } catch (error) {
      console.error("❌ Dashboard search error:", error);
      alert("Terjadi kesalahan saat mencari jadwal kereta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize passengers array when passenger count changes
    const passengerCount = parseInt(searchForm.passenger_count);
    const newPassengers = Array.from({ length: passengerCount }, (_, index) => ({
      name: '',
      nik: '',
      seat_id: null
    }));
    setPassengers(newPassengers);
    setActivePassengerIndex(0); // Set default to first passenger
  }, [searchForm.passenger_count]);

  const fetchStations = async () => {
    try {
      const data = await apiService.getAllStations();
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
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

  const {
    travel_date,
    origin_station,
    destination_station
  } = searchForm;

  console.log("📦 Input Form Data:", searchForm);

  // Validasi form
  if (!travel_date || !origin_station || !destination_station) {
    alert("Semua field harus diisi sebelum mencari jadwal kereta.");
    return;
  }

  const params = {
    schedule_date: travel_date,
    origin_station_id: parseInt(origin_station),
    destination_station_id: parseInt(destination_station),
    train_category: 1 // Hanya 1 kategori untuk sekarang
  };

  console.log("🚀 Query Params to API:", params);

  setLoading(true);

  try {
    const response = await apiService.searchTrainSchedules(params);
    
    // ✅ Debug: Log full response structure
    console.log("🔍 Full API Response:", response);
    console.log("🔍 Response type:", typeof response);
    console.log("🔍 Response.data:", response?.data);
    console.log("🔍 Is response array?", Array.isArray(response));
    console.log("🔍 Is response.data array?", Array.isArray(response?.data));

    // ✅ Handle multiple possible response formats
    let schedules;
    if (Array.isArray(response)) {
      schedules = response;
      console.log("✅ Using response as direct array");
    } else if (response?.data && Array.isArray(response.data)) {
      schedules = response.data;
      console.log("✅ Using response.data as array");
    } else if (response?.schedules && Array.isArray(response.schedules)) {
      schedules = response.schedules;
      console.log("✅ Using response.schedules as array");
    } else if (response?.results && Array.isArray(response.results)) {
      schedules = response.results;
      console.log("✅ Using response.results as array");
    } else {
      schedules = [];
      console.warn("⚠️ Could not find valid schedule array in response");
    }

    console.log("🔍 Extracted schedules:", schedules);
    console.log("🔍 Schedules length:", schedules?.length);

    if (Array.isArray(schedules) && schedules.length > 0) {
      console.log("✅ Jadwal ditemukan:", schedules);
      setAllSchedules(schedules);
      setAvailableSchedules(schedules);
      setCurrentStep(2);
    } else {
      console.warn("⚠️ Tidak ada jadwal ditemukan atau response kosong.");
      console.log("🔍 Adding dummy data for testing...");
      
      // ✅ Add dummy data for testing
      const dummySchedules = [
        {
          schedule_id: 1,
          train_id: 101,
          schedule_date: travel_date,
          departure_time: "08:00",
          arrival_time: "12:00"
        },
        {
          schedule_id: 2,
          train_id: 102,
          schedule_date: travel_date,
          departure_time: "14:00",
          arrival_time: "18:00"
        }
      ];
      
      alert("⚠️ No real data found. Using dummy data for testing.");
      setAllSchedules(dummySchedules);
      setAvailableSchedules(dummySchedules);
      setCurrentStep(2);
    }

  } catch (error) {
    console.error("❌ Gagal mengambil data jadwal:", error);
    console.error("❌ Error details:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    alert(error?.response?.data?.message || "Terjadi kesalahan saat mencari jadwal kereta.");
  } finally {
    setLoading(false);
  }
};



  const selectSchedule = async (schedule) => {
    // 🔍 DEBUG: Log the actual schedule structure
    console.log('🔍 Full schedule object:', schedule);
    console.log('🔍 schedule.train_id:', schedule.train_id);
    console.log('🔍 schedule.train:', schedule.train);
    console.log('🔍 schedule.timing:', schedule.timing);
    console.log('🔍 schedule.schedule_date:', schedule.schedule_date);
    
    setSelectedSchedule(schedule);
    setLoading(true);
    
    try {
      console.log('Selected schedule:', schedule);

      // ✅ Fix: Include all required parameters
      const availableSeatsResponse = await axios.get(`http://localhost:9000/api/bookings/available-seats`, {
        params: {
          // 🔧 Try different property access patterns
          train_id: schedule.train_id || schedule.train?.train_id,
          schedule_date: schedule.schedule_date || schedule.timing?.schedule_date,
          origin_station_id: searchForm.origin_station,
          destination_station_id: searchForm.destination_station
        }
      });

      console.log('Available seats response:', availableSeatsResponse.data);

      // Langsung gunakan data dari response karena sudah include is_booked
      const seatsData = availableSeatsResponse.data || [];
      
      // Map data sesuai format yang dibutuhkan frontend
      const formattedSeats = seatsData.map(seat => ({
        seat_id: seat.seat_id,
        seat_number: seat.seat_number,
        carriage_id: seat.carriage_id,
        class: seat.class,
        isBooked: seat.is_booked // Gunakan is_booked dari API response
      }));

      console.log('Formatted seats with booking status:', formattedSeats);

      setAvailableSeats(formattedSeats);
      setCurrentStep(3);

    } catch (error) {
      console.error('Error fetching available seats:', error);

      // Fallback ke sample data jika API gagal
      const sampleSeats = [];
      for (let i = 1; i <= 20; i++) {
        sampleSeats.push({
          seat_id: i,
          seat_number: `${Math.ceil(i / 4)}${String.fromCharCode(65 + ((i - 1) % 4))}`,
          carriage_id: 1,
          class: 'Economy',
          isBooked: [2, 5, 8, 12, 15].includes(i)
        });
      }

      setAvailableSeats(sampleSeats);
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatSelection = (seat, passengerIndex) => {
    if (seat.isBooked) return;

    // Use seat.seat_id instead of seat.id
    const seatId = seat.seat_id ?? seat.id;

    setPassengers(prev => prev.map((passenger, i) => {
      // Clear seat from ALL passengers first if seat is being selected
      if (passenger.seat_id === seatId) {
        return { ...passenger, seat_id: null };
      }
      
      // Only assign seat to the specific selected passenger
      if (i === passengerIndex) {
        return { 
          ...passenger, 
          seat_id: passenger.seat_id === seatId ? null : seatId
        };
      }
      
      return passenger;
    }));
  };

  const proceedToPassengerDetails = () => {
    const selectedSeatCount = passengers.filter(p => p.seat_id).length;
    if (selectedSeatCount !== parseInt(searchForm.passenger_count)) {
      alert(`Please select exactly ${searchForm.passenger_count} seat(s)`);
      return;
    }
    setCurrentStep(4);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Debug: Log selectedSchedule structure
      console.log('🔍 selectedSchedule in submitBooking:', selectedSchedule);

      if (!selectedSchedule) {
        alert("Schedule belum dipilih dengan benar.");
        return;
      }

      // ✅ Fix: Use same property access pattern as selectSchedule
      const trainId = selectedSchedule.train_id || selectedSchedule.train?.train_id;
      const scheduleDate = selectedSchedule.schedule_date || selectedSchedule.timing?.schedule_date;

      if (!trainId || !scheduleDate) {
        alert("Schedule data tidak lengkap. train_id atau schedule_date tidak ditemukan.");
        console.error('Missing data:', { trainId, scheduleDate, selectedSchedule });
        return;
      }

      const originId = Number(searchForm.origin_station);
      const destinationId = Number(searchForm.destination_station);

      if (!originId || !destinationId) {
        alert("Stasiun asal dan tujuan wajib dipilih.");
        return;
      }

      if (passengers.length === 0) {
        alert("Penumpang belum ditambahkan.");
        return;
      }

      const bookingPayload = {
        train_id: trainId,              // ✅ Use extracted trainId
        schedule_date: scheduleDate,    // ✅ Use extracted scheduleDate
        origin_station_id: originId,
        destination_station_id: destinationId,
        passengers: passengers.map((p) => ({
          seat_id: p.seat_id,
          name: p.name,
          nik: p.nik,
        })),
      };

      console.log("FINAL PAYLOAD:", bookingPayload);

      const response = await apiService.createBooking(bookingPayload);

      if (response && response.message) {
        alert(`${response.message} - Booking ID: ${response.data.booking_id}`);
      } else {
        alert("Booking created successfully!");
      }

      resetBooking();
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking gagal. Cek console.");
    } finally {
      setLoading(false);
    }
  };

  // Tambah fungsi untuk melihat booking user
  const viewMyBookings = async () => {
    try {
      setLoading(true);
      const myBookings = await apiService.getMyBookings();
      console.log('My bookings:', myBookings);
      // Bisa redirect ke halaman booking history atau show modal
      alert(`You have ${myBookings.length} booking(s). Check console for details.`);
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      alert('Error loading your bookings.');
    } finally {
      setLoading(false);
    }
  };

  // Tambah fungsi untuk cancel booking
  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      await apiService.cancelBooking(bookingId);
      alert('Booking cancelled successfully!');
      // Refresh booking list jika ada
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking.');
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
    setSelectedSeats([]);
    setPassengers([]);
    setFilters({
      sortBy: 'departure_time',
      trainClass: '',
      minPrice: '',
      maxPrice: '',
      departureTime: ''
    });
    setSearchForm({
      origin_station: '',
      destination_station: '',
      travel_date: '',
      passenger_count: 1
    });
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === parseInt(stationId));
    return station ? station.station_name : 'Unknown Station';
  };

  const getSeatInfo = (seatId) => {
    const seat = availableSeats.find(s => s.seat_id === seatId);
    return seat || null;
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
                {availableSchedules.map((schedule, index) => {
                  // 🔍 Debug: Log each schedule to see structure
                  console.log(`🔍 Schedule ${index}:`, schedule);
                  
                  return (
                    <div key={schedule.schedule_id || index} className="train-card">
                      <div className="train-header">
                        <div className="train-info">
                          <h3 className="train-name">
                            🚂 {schedule.train_name || schedule.name || `Kereta ${schedule.train_id || 'Unknown'}`}
                          </h3>
                          <div className="train-details">
                            <div className="detail-item">
                              <span className="detail-label">📅 Tanggal</span>
                              <span className="detail-value">{schedule.schedule_date || schedule.date || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">🕐 Keberangkatan</span>
                              <span className="detail-value">{schedule.departure_time || schedule.depart_time || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">🕕 Kedatangan</span>
                              <span className="detail-value">{schedule.arrival_time || schedule.arrive_time || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">⏱️ Estimasi Waktu</span>
                              <span className="detail-value">
                                {schedule.departure_time && schedule.arrival_time ? 
                                  `${Math.round((new Date(`2000-01-01 ${schedule.arrival_time}`) - new Date(`2000-01-01 ${schedule.departure_time}`)) / (1000 * 60 * 60))} jam` 
                                  : schedule.duration || '4 jam'
                                }
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">🚉 Rute</span>
                              <span className="detail-value">
                                {getStationName(searchForm.origin_station)} → {getStationName(searchForm.destination_station)}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">🎫 Kelas</span>
                              <span className="detail-value">{schedule.class || schedule.train_class || 'Economy'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">💺 Kursi Tersedia</span>
                              <span className="detail-value">{schedule.available_seats || 'Tersedia'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="train-actions">
                          <div className="price-info">
                            <span className="price-label">Harga</span>
                            <span className="price-value">
                              {schedule.price ? `Rp ${Number(schedule.price).toLocaleString('id-ID')}` : 'Rp 150.000'}
                            </span>
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
                    </div>
                  );
                })}
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
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;