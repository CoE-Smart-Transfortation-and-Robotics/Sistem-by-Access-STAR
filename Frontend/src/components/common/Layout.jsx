import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../../styles/common/Layout.css';
import logoStar from '../../assets/logo-star.png';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const profileRef = useRef(null);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard' },
        { name: 'User Management', path: '/admin/users' },
        { name: 'Train Management', path: '/admin/train-management' },
        { name: 'Route Management', path: '/admin/route-planning' },
        { name: 'Schedule', path: '/admin/schedules' }
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/user/dashboard' },
        { name: 'Booking', path: '/user/booking' },
        { name: 'History', path: '/user/history' },
        { name: 'Profile', path: '/user/profile' }
      ];
    }
  };

  const navItems = getNavItems();

  const handleMenuClick = (item) => {
    setActiveMenu(item.name);
    handleNavigation(item.path);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-container">
          {/* Bagian Kiri: Logo dan Nama Perusahaan */}
          <div className="header-brand">
            <div className="brand-logo">
              <img 
                src={logoStar}
                alt="STAR System Logo" 
                className="logo-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span className="logo-icon-fallback">🚄</span>
              <div className="brand-text">
                <h1 className="brand-title">STAR System</h1>
                <span className="brand-subtitle">Sistem by Access STAR</span>
              </div>
            </div>
          </div>

          {/* Bagian Tengah: Navigasi Konten */}
          {user && (
            <nav className="center-nav">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleMenuClick(item)}
                  className={`nav-link ${
                    activeMenu === item.name ? 'nav-link-active' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          )}

          {/* Bagian Kanan: Profil dengan Nama & Role */}
          {user && (
            <div className="profile-section">
              <div className="user-info-text">
                <span className="user-name-display">{user.name}</span>
                <span className="user-role-display">
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
              <div className="profile-dropdown" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="profile-button"
                >
                  <img
                    className="profile-avatar"
                    src={user.avatar || "https://placehold.co/100x100/E2E8F0/4A5568?text=" + user.name.charAt(0)}
                    alt="User profile"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/100x100/E2E8F0/4A5568?text=" + user.name.charAt(0);
                    }}
                  />
                </button>
                
                {/* Dropdown Menu Profil */}
                {profileOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        handleNavigation('/user/profile');
                        setProfileOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      <span className="dropdown-icon">👤</span>
                      Profil
                    </button>
                    <button 
                      onClick={() => {
                        console.log('Settings clicked');
                        setProfileOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      <span className="dropdown-icon">⚙️</span>
                      Pengaturan
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="dropdown-item logout-item"
                    >
                      <span className="dropdown-icon">🚪</span>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="main-container">
          {children}
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <img 
                src="/logo-star.png" 
                alt="STAR System Logo" 
                className="footer-logo-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span className="footer-logo">🚄</span>
              <div className="footer-text">
                <h3 className="footer-title">STAR System</h3>
                <p className="footer-tagline">Sistem by Access STAR</p>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><a href="#dashboard">Dashboard</a></li>
                  <li><a href="#reports">Reports</a></li>
                  <li><a href="#analytics">Analytics</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <ul>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="#docs">Documentation</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>System</h4>
                <ul>
                  <li><a href="#status">Status</a></li>
                  <li><a href="#security">Security</a></li>
                  <li><a href="#api">API</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 STAR System. All rights reserved.</p>
            <div className="footer-meta">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;