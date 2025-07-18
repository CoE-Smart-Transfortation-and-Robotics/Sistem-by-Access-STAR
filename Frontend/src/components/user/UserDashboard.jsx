import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      icon: '🚂', 
      title: 'KA Bandara', 
      action: 'airport-train',
      color: '#4A90E2',
      description: 'Layanan kereta ke bandara',
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
        console.log('Navigate to booking page');
        break;
      case 'view-bookings':
        console.log('Navigate to bookings page');
        break;
      case 'cancel-booking':
        console.log('Navigate to cancellation page');
        break;
      case 'reschedule':
        console.log('Navigate to reschedule page');
        break;
      default:
        console.log(`Action: ${action} - Coming soon!`);
    }
  };

  return (
    <div className="user-dashboard-container">
      {/* Welcome Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="welcome-text">
            <h1>Selamat Datang, {user?.name}!</h1>
            <p>Nikmati kemudahan perjalanan kereta api dengan layanan STAR System yang terpercaya</p>
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
            onClick={() => navigate('/booking')}
          >
            <div className="action-icon">📋</div>
            <h3>Tiket Saya</h3>
            <p>Kelola pemesanan</p>
            <div className="action-arrow">→</div>
          </div>
          
          <div
            className="quick-action-card tertiary"
            onClick={() => navigate('/booking')}
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
        <div className="services-grid">
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