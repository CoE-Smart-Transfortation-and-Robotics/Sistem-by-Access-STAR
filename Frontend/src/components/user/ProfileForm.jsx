import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const ProfileForm = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nik: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        nik: user.nik || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Profil berhasil diperbarui!');
      setMessageType('success');
    } catch (err) {
      setMessage('Error: ' + err.message);
      setMessageType('error');
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
    <div className="profile-form-container">
      <div className="profile-header">
        <h2>Profil Saya</h2>
        <p>Kelola informasi profil Anda untuk pengalaman yang lebih personal</p>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          <span className="message-icon">
            {messageType === 'success' ? '✓' : '⚠'}
          </span>
          {message}
        </div>
      )}

      <div className="profile-content">
        {/* User Info Card */}
        <div className="user-info-card">
          <div className="user-avatar-section">
            <div className="user-avatar-large">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="user-basic-info">
              <h3>{user?.name}</h3>
              <p className="user-email">{user?.email}</p>
              <span className="user-role-badge">{user?.role}</span>
            </div>
          </div>
          
          <div className="user-stats">
            <div className="user-stat">
              <span className="stat-value">0</span>
              <span className="stat-label">Perjalanan</span>
            </div>
            <div className="user-stat">
              <span className="stat-value">0</span>
              <span className="stat-label">Poin</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="profile-form-card">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Informasi Pribadi</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nama Lengkap</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan alamat email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Nomor Telepon</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="nik">NIK</label>
                  <input
                    type="text"
                    id="nik"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan NIK"
                    maxLength="16"
                  />
                </div>
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="address">Alamat</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>
            </div>

            {/* Role Display (Read-only)
            <div className="form-section">
              <h3>Informasi Akun</h3>
              <div className="form-group">
                <label>Role Pengguna</label>
                <div className="readonly-field">
                  <span className="role-display">{user?.role || ''}</span>
                  <span className="readonly-note">Role tidak dapat diubah</span>
                </div>
              </div>
            </div>
             */}
            <div className="form-actions">
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">💾</span>
                    Simpan Perubahan
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => window.location.reload()}
              >
                <span className="btn-icon">🔄</span>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;