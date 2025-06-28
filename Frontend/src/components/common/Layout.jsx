import { useAuth } from '../../hooks/useAuth';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1>STAR System</h1>
          {user && (
            <nav className="nav-menu">
              <span>Welcome, {user.name} ({user.role})</span>
              
              {user.role === 'admin' && (
                <>
                  <button onClick={() => handleNavigation('/admin/dashboard')}>
                    Admin Dashboard
                  </button>
                  <button onClick={() => handleNavigation('/admin/users')}>
                    User Management
                  </button>
                </>
              )}
              
              {(user.role === 'user' || user.role === 'visitor') && (
                <button onClick={() => handleNavigation('/user/dashboard')}>
                  Dashboard
                </button>
              )}
              
              <button onClick={() => handleNavigation('/user/profile')}>
                Profile
              </button>
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;