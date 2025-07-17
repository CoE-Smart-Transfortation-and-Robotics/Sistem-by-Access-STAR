
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth/auth.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);

      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="form-container">

      <div className="form-left-panel">
        <div className="brand-showcase">
          <div className="brand-logo-large">🚄</div>
          <h1 className="brand-title">STAR System</h1>
          <p className="brand-description">
            Sistem Reservasi Tiket Kereta Api Terpadu
          </p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">🎫</span>
              <span className="feature-text">Pemesanan Mudah</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Proses Cepat</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Aman & Terpercaya</span>
            </div>
          </div>
          <div className="decorative-pattern"></div>
        </div>
      </div>


      <div className="form-right-panel">
        <div className="form-wrapper">
          <form onSubmit={handleSubmit} className="form">
            <h2>Masuk ke STAR System</h2>
            <p className="brand-tagline">Selamat datang kembali!</p>
            
            {error && <div className="error">{error}</div>}
            
            <div className="input-group email">
              <input
                type="email"
                name="email"
                placeholder="Alamat Email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="input-group password">
              <input
                type="password"
                name="password"
                placeholder="Kata Sandi"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
            
            <div className="forgot-password">
              <a href="/forgot-password">Lupa kata sandi?</a>
            </div>
            
            <button type="submit" disabled={loading}>
              {loading && <span className="loading-spinner"></span>}
              {loading ? 'Sedang Masuk...' : 'Masuk'}
            </button>
            
            <div className="social-login">
              <p>Atau masuk dengan</p>
              <div className="social-buttons">
                <button type="button" className="social-btn">
                  📱 SMS OTP
                </button>
                <button type="button" className="social-btn">
                  🎫 Nomor Tiket
                </button>
              </div>
            </div>
            
            <p>
              Belum punya akun? 
              <a href="/register"> Daftar sekarang</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;