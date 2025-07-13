import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <header style={{ padding: '1rem', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>STAR System</h1>
          {user && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Welcome, {user.name}</span>
              <button onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
              <button onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </header>
      <main style={{ padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;