import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import heroBackground1 from '../../assets/jakarta.jpg';
import heroBackground2 from '../../assets/bandung.webp';
import heroBackground3 from '../../assets/semarang.webp';
import heroBackground4 from '../../assets/yogyakarta.jpg';
import heroBackground5 from '../../assets/surabaya.jpg';
import heroBackground6 from '../../assets/malang.jpg';
import promo1 from '../../assets/bandung.webp';
import promo2 from '../../assets/semarang.webp';
import promo3 from '../../assets/yogyakarta.jpg';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Hero backgrounds for automatic slide transition
  const heroBackgrounds = [
    {
      image: heroBackground1,
      title: "Jelajahi Keindahan Jakarta",
      subtitle: "Nikmati perjalanan menuju ibu kota dengan kereta api modern"
    },
    {
      image: heroBackground2,
      title: "Pesona Bandung Menanti",
      subtitle: "Rasakan sejuknya udara pegunungan dengan perjalanan yang nyaman"
    },
    {
      image: heroBackground3,
      title: "Kota Semarang yang Bersejarah",
      subtitle: "Temukan warisan budaya dan kuliner khas Jawa Tengah"
    },
    {
      image: heroBackground4,
      title: "Yogyakarta Istimewa",
      subtitle: "Kunjungi kota pelajar dengan perjalanan yang tak terlupakan"
    },
    {
      image: heroBackground5,
      title: "Surabaya Kota Pahlawan",
      subtitle: "Jelajahi kota metropolitan dengan layanan kereta terbaik"
    },
    {
      image: heroBackground6,
      title: "Malang Kota Apel",
      subtitle: "Nikmati kesejukan kota apel dengan perjalanan yang aman"
    }
  ];
  
  // Hero carousel state
  const [currentHero, setCurrentHero] = useState(0);
  
  // Train search state
  const [searchForm, setSearchForm] = useState({
    origin_station: '',
    destination_station: '',
    travel_date: '',
    passenger_count: 1
  });
  
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Promo carousel state
  const [currentPromo, setCurrentPromo] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const [cardDimensions, setCardDimensions] = useState({ width: 384, gap: 24 }); 
  
  const promoData = [
    {
      id: 1,
      title: "Diskon 50% Kereta Bandung",
      description: "Nikmati perjalanan ke Bandung dengan harga spesial! Berlaku hingga akhir bulan.",
      image: promo1,
      badge: "50% OFF",
      validUntil: "31 Juli 2025"
    },
    {
      id: 2,
      title: "Promo Weekend Semarang",
      description: "Jelajahi keindahan Semarang dengan tarif khusus weekend. Book sekarang!",
      image: promo2,
      badge: "WEEKEND DEAL",
      validUntil: "Setiap Weekend"
    },
    {
      id: 3,
      title: "Flash Sale Yogyakarta",
      description: "Kesempatan terbatas! Tiket ke Yogyakarta dengan harga fantastis.",
      image: promo3,
      badge: "FLASH SALE",
      validUntil: "3 Hari Lagi"
    },
    {
      id: 4,
      title: "Promo Jakarta - Surabaya",
      description: "Nikmati perjalanan lintas pulau dengan harga spesial!",
      image: heroBackground5,
      badge: "SPECIAL",
      validUntil: "15 Agustus 2025"
    },
    {
      id: 5,
      title: "Weekend Escape Malang",
      description: "Liburan seru ke kota apel dengan penawaran menarik.",
      image: heroBackground6,
      badge: "WEEKEND",
      validUntil: "Setiap Weekend"
    },
    {
      id: 6,
      title: "Early Bird Jakarta",
      description: "Booking lebih awal, harga lebih hemat untuk perjalanan ke Jakarta.",
      image: heroBackground1,
      badge: "EARLY BIRD",
      validUntil: "20 Agustus 2025"
    }
  ];

  useEffect(() => {
    fetchStations();
    
    // Auto-rotate hero carousel
    const heroInterval = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % heroBackgrounds.length);
    }, 6000); // Change every 6 seconds
    
    // Update itemsPerPage based on screen size
    const updateItemsPerPage = () => {
      if (window.innerWidth <= 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth <= 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    
    return () => {
      clearInterval(heroInterval);
      window.removeEventListener('resize', updateItemsPerPage);
    };
  }, []);


  useEffect(() => {
    const promoInterval = setInterval(() => {
      setCurrentPromo(prev => {
        const maxIdx = Math.max(0, promoData.length - itemsPerPage);
        return prev >= maxIdx ? 0 : prev + 1;
      });
    }, 5000);
    
    return () => {
      clearInterval(promoInterval);
    };
  }, [itemsPerPage, promoData.length]);

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

  const searchTrains = async (e) => {
    e.preventDefault();

    const {
      travel_date,
      origin_station,
      destination_station
    } = searchForm;

    // Validasi form
    if (!travel_date || !origin_station || !destination_station) {
      alert("Semua field harus diisi sebelum mencari jadwal kereta.");
      return;
    }

    // Navigate to booking page with search parameters
    navigate('/booking', { 
      state: { 
        searchData: searchForm,
        fromDashboard: true 
      } 
    });
  };

  const maxIndex = Math.max(0, promoData.length - itemsPerPage);

  // Calculate card width and gap based on screen size
  const getCardDimensions = () => {
    if (window.innerWidth <= 768) {
      return { width: 280, gap: 24 };
    } else if (window.innerWidth <= 1024) {
      return { width: 320, gap: 24 };
    } else {
      return { width: 384, gap: 24 };
    }
  };

  const nextPromo = () => {
    setCurrentPromo(prev => Math.min(prev + 1, maxIndex));
  };

  const prevPromo = () => {
    setCurrentPromo(prev => Math.max(prev - 1, 0));
  };

  const goToPromo = (index) => {
    setCurrentPromo(Math.min(index, maxIndex));
  };

  const menuItems = [
    { 
      icon: '🎫', 
      title: 'Beli Tiket Kereta', 
      action: 'book-ticket',
      color: '#2E86AB',
      description: 'Pesan tiket untuk perjalanan Anda',
      category: 'booking'
    },
    { 
      icon: '📋', 
      title: 'Riwayat Pemesanan', 
      action: 'view-bookings',
      color: '#A23B72',
      description: 'Lihat dan kelola pemesanan',
      category: 'booking'
    },
    { 
      icon: '💳', 
      title: 'Pembatalan Tiket', 
      action: 'cancel-booking',
      color: '#F18F01',
      description: 'Batalkan tiket yang sudah dipesan',
      category: 'booking'
    },
    { 
      icon: '📅', 
      title: 'Ubah Jadwal', 
      action: 'reschedule',
      color: '#C73E1D',
      description: 'Reschedule perjalanan Anda',
      category: 'booking'
    },
    { 
      icon: '�', 
      title: 'Papan Jadwal', 
      action: 'schedule-board',
      color: '#4A90E2',
      description: 'Lihat jadwal keberangkatan kereta',
      category: 'service'
    },
    { 
      icon: '🍽️', 
      title: 'Railfood', 
      action: 'railfood',
      color: '#7B68EE',
      description: 'Pesan makanan di kereta',
      category: 'service'
    },
    { 
      icon: 'ℹ️', 
      title: 'Informasi KRL', 
      action: 'krl-info',
      color: '#20B2AA',
      description: 'Jadwal dan info KRL',
      category: 'information'
    },
    { 
      icon: '📦', 
      title: 'KAI Logistik', 
      action: 'logistics',
      color: '#FF6347',
      description: 'Layanan pengiriman barang',
      category: 'service'
    }
  ];

  const recentActivities = [
    {
      icon: '🎫',
      title: 'Pemesanan Tiket',
      description: 'Belum ada pemesanan',
      time: 'Sekarang',
      type: 'booking'
    },
    {
      icon: '💰',
      title: 'Riwayat Pembayaran',
      description: 'Belum ada pembayaran',
      time: 'Sekarang',
      type: 'payment'
    },
    {
      icon: '⭐',
      title: 'Poin Reward',
      description: 'Mulai kumpulkan poin',
      time: 'Sekarang',
      type: 'reward'
    }
  ];

  const handleMenuClick = (action) => {
    switch (action) {
      case 'book-ticket':
        navigate('/booking');
        break;
      case 'view-bookings':
        navigate('/booking-history');
        break;
      case 'cancel-booking':
        console.log('Navigate to cancellation page');
        break;
      case 'reschedule':
        console.log('Navigate to reschedule page');
        break;
      case 'schedule-board':
        navigate('/schedule-board');
        break;
      default:
        console.log(`Action: ${action} - Coming soon!`);
    }
  };

  return (
    <div className="user-dashboard-container">
      {/* Welcome Hero Section with Auto Carousel */}
      <div className="dashboard-hero" style={{
        backgroundImage: `linear-gradient(135deg, rgba(10, 25, 47, 0.85) 0%, rgba(30, 41, 59, 0.85) 100%), url(${heroBackgrounds[currentHero].image})`
      }}>
        <div className="hero-content">
          <div className="welcome-text">
            <h1>Selamat Datang, {user?.name}!</h1>
            <div className="hero-subtitle-container">
              <h2 className="hero-dynamic-title">{heroBackgrounds[currentHero].title}</h2>
              <p className="hero-dynamic-subtitle">{heroBackgrounds[currentHero].subtitle}</p>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Perjalanan</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Poin Reward</span>
            </div>
          </div>
        </div>
        

      </div>

      {/* Train Search Section */}
      <div className="train-search-section">
        <div className="search-header">
          <h2>🚄 Cari Kereta</h2>
          <p>Temukan jadwal kereta terbaik untuk perjalanan Anda</p>
        </div>
        
        <div className="search-container">
          <form onSubmit={searchTrains} className="train-search-form">
            <div className="search-row">
              <div className="search-field">
                <label className="search-label">
                  <span className="label-icon">📍</span>
                  Stasiun Asal
                </label>
                <div className="search-input-wrapper">
                  <select
                    name="origin_station"
                    value={searchForm.origin_station}
                    onChange={handleSearchChange}
                    required
                    className="search-select"
                  >
                    <option value="">Pilih stasiun keberangkatan</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.station_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="search-field">
                <label className="search-label">
                  <span className="label-icon">🎯</span>
                  Stasiun Tujuan
                </label>
                <div className="search-input-wrapper">
                  <select
                    name="destination_station"
                    value={searchForm.destination_station}
                    onChange={handleSearchChange}
                    required
                    className="search-select"
                  >
                    <option value="">Pilih stasiun tujuan</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.station_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="search-field">
                <label className="search-label">
                  <span className="label-icon">📅</span>
                  Tanggal Keberangkatan
                </label>
                <div className="search-input-wrapper">
                  <input
                    type="date"
                    name="travel_date"
                    value={searchForm.travel_date}
                    onChange={handleSearchChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="search-date-input"
                  />
                </div>
              </div>

              <div className="search-field">
                <label className="search-label">
                  <span className="label-icon">👥</span>
                  Jumlah Penumpang
                </label>
                <div className="search-input-wrapper">
                  <select
                    name="passenger_count"
                    value={searchForm.passenger_count}
                    onChange={handleSearchChange}
                    className="search-select"
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} Penumpang</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="search-action">
                <button
                  type="submit"
                  disabled={loading}
                  className="search-submit-btn"
                >
                  <span className="btn-icon">🔍</span>
                  {loading ? 'Mencari...' : 'Cari Kereta'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Promo Carousel Section */}
      <div className="promo-section-container">
        <h2 className="promo-title">Promo terbaik buat liburan irit!</h2>
        <div className="carousel-container">
          <div className="carousel-viewport">
            <div 
              className="carousel-track"
              style={{ 
                transform: `translateX(-${currentPromo * (getCardDimensions().width-22 + getCardDimensions().gap)}px)` 
              }}
            >
              {promoData.map((promo, index) => (
                <div key={promo.id} className="promo-card">
                  <img src={promo.image} alt={promo.title} />
                </div>
              ))}
            </div>
          </div>
          <div 
            className={`carousel-nav prev ${currentPromo === 0 ? 'disabled' : ''}`} 
            onClick={() => currentPromo > 0 && prevPromo()}
          >
            {'<'}
          </div>
          <div 
            className={`carousel-nav next ${currentPromo >= maxIndex ? 'disabled' : ''}`} 
            onClick={() => currentPromo < maxIndex && nextPromo()}
          >
            {'>'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Aksi Cepat</h2>
        <div className="quick-actions-grid">
          <div
            className="quick-action-card primary"
            onClick={() => navigate('/booking')}
          >
            <div className="action-icon">🎫</div>
            <h3>Beli Tiket</h3>
            <p>Mulai perjalanan Anda</p>
            <div className="action-arrow">→</div>
          </div>
          
          <div
            className="quick-action-card secondary"
            onClick={() => navigate('/bookinghistory')}
          >
            <div className="action-icon">📋</div>
            <h3>Tiket Saya</h3>
            <p>Kelola pemesanan</p>
            <div className="action-arrow">→</div>
          </div>
          
          <div
            className="quick-action-card tertiary"
            onClick={() => navigate('/bookinghistory')}
          >
            <div className="action-icon">💳</div>
            <h3>Pembatalan</h3>
            <p>Batalkan tiket</p>
            <div className="action-arrow">→</div>
          </div>
        </div>
      </div>

      {/* All Services */}
      <div className="all-services-section">
        <h2>Semua Layanan</h2>
        <div className="services-grid-da">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className={`service-card ${item.category}`}
              onClick={() => handleMenuClick(item.action)}
            >
              <div className="service-header">
                <div 
                  className="service-icon" 
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
              </div>
              <p>{item.description}</p>
              <div className="service-footer">
                <span className="learn-more">Selengkapnya →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics and Recent Activities */}
      <div className="dashboard-content">
        {/* Statistics Dashboard */}
        <div className="stats-dashboard">
          <h2>Statistik Perjalanan</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">🎫</span>
                <span className="stat-trend positive">+0%</span>
              </div>
              <div className="stat-body">
                <h3>0</h3>
                <p>Total Pemesanan</p>
                <span className="stat-period">Bulan ini</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">🚂</span>
                <span className="stat-trend positive">+0%</span>
              </div>
              <div className="stat-body">
                <h3>0</h3>
                <p>Perjalanan Selesai</p>
                <span className="stat-period">Total</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">💰</span>
                <span className="stat-trend neutral">0%</span>
              </div>
              <div className="stat-body">
                <h3>Rp 0</h3>
                <p>Total Pengeluaran</p>
                <span className="stat-period">Tahun ini</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">⭐</span>
                <span className="stat-trend positive">+0</span>
              </div>
              <div className="stat-body">
                <h3>0</h3>
                <p>Poin Reward</p>
                <span className="stat-period">Tersedia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="recent-activities">
          <h2>Aktivitas Terbaru</h2>
          <div className="activities-container">
            <div className="activities-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className={`activity-item activity-${activity.type}`}>
                  <div className="activity-icon">
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <div className="activity-status">
                    <div className="status-dot"></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="activity-summary">
              <h3>Ringkasan Hari Ini</h3>
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="summary-number">0</span>
                  <span className="summary-label">Pemesanan</span>
                </div>
                <div className="summary-item">
                  <span className="summary-number">0</span>
                  <span className="summary-label">Perjalanan</span>
                </div>
                <div className="summary-item">
                  <span className="summary-number">0</span>
                  <span className="summary-label">Poin Earned</span>
                </div>
              </div>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;