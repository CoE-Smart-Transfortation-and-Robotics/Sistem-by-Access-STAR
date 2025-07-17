
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    nik: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError('Harap setujui syarat dan ketentuan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      alert('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
      navigate('/login');
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
      {/* Left Panel - Image/Brand Section */}
      <div className="form-left-panel">
        <div className="brand-showcase">
          <div className="brand-logo-large">🚄</div>
          <h1 className="brand-title">STAR System</h1>
          <p className="brand-description">
            Bergabunglah dengan jutaan pengguna untuk pengalaman perjalanan yang tak terlupakan
          </p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">🌟</span>
              <span className="feature-text">Layanan Premium</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Destinasi Lengkap</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span className="feature-text">Harga Terjangkau</span>
            </div>
          </div>
          <div className="decorative-pattern"></div>
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="form-right-panel">
        <div className="form-wrapper">
          <form onSubmit={handleSubmit} className="form">
            <h2>Daftar STAR System</h2>
            <p className="brand-tagline">Buat akun untuk menikmati perjalanan kereta api</p>
            
            {error && <div className="error">{error}</div>}
            
            {/* Grid Layout untuk Input Fields */}
            <div className="form-grid">
              <div className="input-group name">
                <input
                  type="text"
                  name="name"
                  placeholder="Nama Lengkap"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
              
              <div className="input-group phone">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Nomor Telepon"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                />
              </div>
              
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
                  minLength="6"
                  autoComplete="new-password"
                />
              </div>
              
              <div className="input-group nik form-full-width">
                <input
                  type="text"
                  name="nik"
                  placeholder="NIK (Nomor Induk Kependudukan)"
                  value={formData.nik}
                  onChange={handleChange}
                  required
                  minLength="16"
                  maxLength="16"
                />
              </div>
              
              <div className="input-group address form-full-width">
                <input
                  type="text"
                  name="address"
                  placeholder="Alamat Lengkap"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  autoComplete="address-line1"
                />
              </div>
            </div>
            
            <div className="terms-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span className="terms-text">
                  Saya setuju dengan{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    Syarat & Ketentuan
                  </a>
                  {' '}dan{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">
                    Kebijakan Privasi
                  </a>
                </span>
              </label>
            </div>
            
            <button type="submit" disabled={loading || !acceptTerms}>
              {loading && <span className="loading-spinner"></span>}
              {loading ? 'Sedang Mendaftar...' : 'Daftar Sekarang'}
            </button>
            
            <p className="auth-footer-text">
              Sudah punya akun? 
              <a href="/login" className="auth-link"> Masuk di sini</a>
            </p>
            <p className="auth-footer-text">
              <a href="/" className="auth-link">← Kembali ke Beranda</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;