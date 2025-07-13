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
                  </div>
                )}
                
                <div className="nav-group">
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

      {/* Footer (optional) */}
      <footer className="app-footer">
        <div className="footer-container">
          <p>&copy; 2025 STAR System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;