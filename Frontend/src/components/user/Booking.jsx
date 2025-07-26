import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import axios from 'axios';

const BookingPage = () => {
  const navigate = useNavigate();
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
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Multiple passengers data
  const [passengers, setPassengers] = useState([]);
  const [activePassengerIndex, setActivePassengerIndex] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

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

    // Validasi isi respons
    const schedules = response?.data;
    if (Array.isArray(schedules) && schedules.length > 0) {
      console.log("✅ Jadwal ditemukan:", schedules);
      setAvailableSchedules(schedules);
      setCurrentStep(2);
    } else {
      console.warn("⚠️ Tidak ada jadwal ditemukan atau response kosong.");
      alert("Tidak ada jadwal tersedia untuk rute dan tanggal yang dipilih.");
    }

  } catch (error) {
    console.error("❌ Gagal mengambil data jadwal:", error);
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
    setAvailableSeats([]);
    setSelectedSeats([]);
    setPassengers([]);
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
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Train Booking System
      </h1>

      {/* Step 1: Search */}
      {currentStep === 1 && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3>Search Trains</h3>
          
          <form onSubmit={searchTrains} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>From:</label>
                <select
                  name="origin_station"
                  value={searchForm.origin_station}
                  onChange={handleSearchChange}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select Origin</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.station_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>To:</label>
                <select
                  name="destination_station"
                  value={searchForm.destination_station}
                  onChange={handleSearchChange}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select Destination</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.station_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Date:</label>
                <input
                  type="date"
                  name="travel_date"
                  value={searchForm.travel_date}
                  onChange={handleSearchChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              
              <div>
                <label>Passengers:</label>
                <select
                  name="passenger_count"
                  value={searchForm.passenger_count}
                  onChange={handleSearchChange}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Searching...' : 'Search Trains'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Select Train */}
      {currentStep === 2 && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3>Available Trains</h3>
            <button onClick={() => setCurrentStep(1)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
              Back
            </button>
          </div>

          <p>Route: {getStationName(searchForm.origin_station)} → {getStationName(searchForm.destination_station)} | Date: {searchForm.travel_date}</p>

          {availableSchedules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h4>No trains found</h4>
              <button onClick={() => setCurrentStep(1)} style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                Try Different Search
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {availableSchedules.map(schedule => (
                <div key={schedule.schedule_id}
 style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h4>Train #{schedule.train_id}</h4>
                    <p>Date: {schedule.schedule_date}</p>
                  </div>
                  <button
                    onClick={() => selectSchedule(schedule)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Seat Selection */}
      {currentStep === 3 && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3>Select Seats for {searchForm.passenger_count} Passenger(s)</h3>
            <button onClick={() => setCurrentStep(2)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
              Back
            </button>
          </div>

          {/* Passenger Seat Assignment */}
          <div style={{ marginBottom: '2rem' }}>
            {passengers.map((passenger, index) => (
              <div key={`passenger-info-${index}`} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <h4>Passenger {index + 1}</h4>
                <p>Selected Seat: {passenger.seat_id ? getSeatInfo(passenger.seat_id)?.seat_number : 'None'}</p>
              </div>
            ))}
          </div>

          {/* Seat Map */}
          <div style={{ marginBottom: '2rem' }}>
            <h4>Select Seats (Click passenger first, then click seat):</h4>
            
            {/* Passenger Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <h5>Choose passenger to assign seat:</h5>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {passengers.map((passenger, index) => (
                  <button
                    key={`passenger-${index}`}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Setting active passenger to:', index);
                      setActivePassengerIndex(index);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: activePassengerIndex === index ? '#007bff' : '#f8f9fa',
                      color: activePassengerIndex === index ? 'white' : '#333',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Passenger {index + 1} {passenger.seat_id ? `(${getSeatInfo(passenger.seat_id)?.seat_number})` : '(No seat)'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxWidth: '300px', margin: '0 auto' }}>
              {availableSeats.slice(0, 20).map((seat, index) => {
                const seatId = seat.seat_id;
                const isSelectedByCurrentPassenger = passengers[activePassengerIndex]?.seat_id === seatId;
                const isSelectedByOtherPassenger = passengers.some((p, pIndex) => p.seat_id === seatId && pIndex !== activePassengerIndex);
                const isBooked = seat.isBooked;
                
                let buttonStyle = {
                  width: '50px',
                  height: '50px',
                  borderRadius: '4px',
                  cursor: isBooked ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                };
                
                if (isBooked) {
                  buttonStyle.backgroundColor = '#dc3545';
                  buttonStyle.border = '2px solid #dc3545';
                  buttonStyle.color = 'white';
                } else if (isSelectedByCurrentPassenger) {
                  buttonStyle.backgroundColor = '#007bff';
                  buttonStyle.border = '2px solid #007bff';
                  buttonStyle.color = 'white';
                } else if (isSelectedByOtherPassenger) {
                  buttonStyle.backgroundColor = '#28a745';
                  buttonStyle.border = '2px solid #28a745';
                  buttonStyle.color = 'white';
                } else {
                  buttonStyle.backgroundColor = 'white';
                  buttonStyle.border = '2px solid #6c757d';
                  buttonStyle.color = '#333';
                }
                
                return (
                  <button
                    key={`seat-${seatId}-${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isBooked && !loading) {
                        toggleSeatSelection(seat, activePassengerIndex);
                      }
                    }}
                    disabled={isBooked || loading}
                    style={buttonStyle}
                  >
                    {seat.seat_number}
                  </button>
                );
              })}
            </div>
            
            {activePassengerIndex === null && (
              <p style={{ textAlign: 'center', color: '#dc3545', marginTop: '1rem' }}>
                Please select a passenger first, then click on a seat
              </p>
            )}
          </div>

          <button
            onClick={proceedToPassengerDetails}
            disabled={passengers.filter(p => p.seat_id).length !== parseInt(searchForm.passenger_count)}
            style={{
              padding: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Continue to Passenger Details
          </button>
        </div>
      )}

      {/* Step 4: Passenger Details */}
      {currentStep === 4 && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3>Passenger Details</h3>
            <button onClick={() => setCurrentStep(3)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
              Back
            </button>
          </div>

          <form onSubmit={submitBooking} style={{ display: 'grid', gap: '2rem' }}>
            {passengers.map((passenger, index) => (
              <div key={index} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <h4>Passenger {index + 1} - Seat {getSeatInfo(passenger.seat_id)?.seat_number}</h4>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label>Full Name:</label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.5rem' }}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label>NIK (Identity Number):</label>
                    <input
                      type="text"
                      value={passenger.nik}
                      onChange={(e) => handlePassengerChange(index, 'nik', e.target.value)}
                      required
                      maxLength="16"
                      style={{ width: '100%', padding: '0.5rem' }}
                      placeholder="Enter 16-digit NIK"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <button
                type="button"
                onClick={resetBooking}
                style={{ padding: '1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Start Over
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ padding: '1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                {loading ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookingPage;