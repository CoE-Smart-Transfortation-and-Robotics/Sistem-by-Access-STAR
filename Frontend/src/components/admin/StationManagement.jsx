import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../../styles/admin/StationManagement.css';

const StationManagement = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  
  const [formData, setFormData] = useState({
    station_name: '',
    station_code: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllStations();
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      alert('Gagal mengambil data stasiun');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.station_name.trim()) {
      newErrors.station_name = 'Nama stasiun wajib diisi';
    }
    
    if (!formData.station_code.trim()) {
      newErrors.station_code = 'Kode stasiun wajib diisi';
    } else if (formData.station_code.length !== 3) {
      newErrors.station_code = 'Kode stasiun harus 3 karakter';
    }
    
    const isDuplicate = stations.some(station => 
      station.station_code.toLowerCase() === formData.station_code.toLowerCase() &&
      station.id !== editingStation?.id
    );
    
    if (isDuplicate) {
      newErrors.station_code = 'Kode stasiun sudah digunakan';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (editingStation) {
        await apiService.updateStation(editingStation.id, formData);
        alert('Stasiun berhasil diperbarui');
      } else {
        await apiService.createStation(formData);
        alert('Stasiun berhasil ditambahkan');
      }
      
      await fetchStations();
      resetForm();
    } catch (error) {
      console.error('Error saving station:', error);
      alert(error?.response?.data?.message || 'Gagal menyimpan stasiun');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setFormData({
      station_name: station.station_name,
      station_code: station.station_code
    });
    setShowForm(true);
  };

  const handleDelete = async (stationId, stationName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus stasiun "${stationName}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await apiService.deleteStation(stationId);
      alert('Stasiun berhasil dihapus');
      await fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
      alert(error?.response?.data?.message || 'Gagal menghapus stasiun');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ station_name: '', station_code: '' });
    setEditingStation(null);
    setShowForm(false);
    setErrors({});
  };

  const handleStationCodeChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 3);
    setFormData(prev => ({ ...prev, station_code: value }));
    
    if (errors.station_code) {
      setErrors(prev => ({ ...prev, station_code: '' }));
    }
  };

  return (
    <div className="station-management">
      <div className="header">
        <h2>Station Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="btn btn-primary"
        >
          + Tambah Stasiun
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingStation ? 'Edit Stasiun' : 'Tambah Stasiun Baru'}</h3>
              <button onClick={resetForm} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="station-form">
              <div className="form-group">
                <label>Nama Stasiun*</label>
                <input
                  type="text"
                  name="station_name"
                  value={formData.station_name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Stasiun Gambir"
                  required
                />
                {errors.station_name && <span className="error">{errors.station_name}</span>}
              </div>

              <div className="form-group">
                <label>Kode Stasiun* (3 huruf)</label>
                <input
                  type="text"
                  name="station_code"
                  value={formData.station_code}
                  onChange={handleStationCodeChange}
                  placeholder="GMR"
                  maxLength="3"
                  required
                />
                {errors.station_code && <span className="error">{errors.station_code}</span>}
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Menyimpan...' : editingStation ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stations List */}
      <div className="stations-list">
        {loading && !showForm ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="stations-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Stasiun</th>
                  <th>Kode Stasiun</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">
                      Belum ada data stasiun
                    </td>
                  </tr>
                ) : (
                  stations.map(station => (
                    <tr key={station.id}>
                      <td>{station.id}</td>
                      <td>{station.station_name}</td>
                      <td>
                        <span className="station-code">{station.station_code}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(station)}
                            className="btn btn-edit"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(station.id, station.station_name)}
                            className="btn btn-delete"
                            disabled={loading}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationManagement;