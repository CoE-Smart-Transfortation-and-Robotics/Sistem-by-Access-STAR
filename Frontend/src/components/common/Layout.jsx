import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../../styles/common/Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-container">
          {/* Logo Section */}
          <div className="header-brand">
            <div className="brand-logo">
              <span className="logo-icon">🚄</span>
              <div className="brand-text">
                <h1 className="brand-title">STAR System</h1>
                <span className="brand-subtitle">Sistem by Access STAR</span>
              </div>
            </div>
          </div>

          {/* User Navigation */}
          {user && (
            <nav className="header-nav">
              <div className="user-info">
                <div className="user-avatar">
                  <span className="avatar-icon">👤</span>
                </div>
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  {/* Only show role for admin */}
                  {user.role === 'admin' && (
                    <span className="user-role">{user.role}</span>
                  )}
                </div>
              </div>

              <div className="nav-divider"></div>

              <div className="nav-buttons">
                {user.role === 'admin' && (
                  <div className="nav-group">
                    <button 
                      className="nav-btn admin-btn"
                      onClick={() => handleNavigation('/admin/dashboard')}
                    >
                      <span className="btn-icon">📊</span>
                      Dashboard
                    </button>
                    <button 
                      className="nav-btn admin-btn"
                      onClick={() => handleNavigation('/admin/users')}
                    >
                      <span className="btn-icon">👥</span>
                      User Mgt
                    </button>
                    <button 
                      className="nav-btn admin-btn"
                      onClick={() => handleNavigation('/admin/train-management')}
                    >
                      <span className="btn-icon">🚂</span>
                      Trains
                    </button>
                  </div>
                )}
                
                {(user.role === 'user' || user.role === 'visitor') && (
                  <div className="nav-group">
                    <button 
                      className="nav-btn user-btn"
                      onClick={() => handleNavigation('/user/dashboard')}
                    >
                      <span className="btn-icon">🏠</span>
                      Dashboard
                    </button>
                    <button 
                    className="nav-btn profile-btn"
                    onClick={() => handleNavigation('/user/profile')}
                  >
                    <span className="btn-icon">⚙️</span>
                    Profile
                  </button>
                  <button 
                    className="nav-btn logout-btn" 
                    onClick={logout}
                  >
                    <span className="btn-icon">🚪</span>
                    Logout
                  </button>
                  </div>
                )}
              </div>
            </nav>
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