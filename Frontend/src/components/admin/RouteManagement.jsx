import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../../styles/admin/RouteManagement.css';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    schedule_id: '',
    station_id: '',
    station_order: '',
    arrival_time: '',
    departure_time: ''
  });

  useEffect(() => {
    fetchRoutes();
    fetchSchedules();
    fetchStations();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllScheduleRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      // Fallback dummy data
      setRoutes([
        {
          id: 1,
          schedule_id: 1,
          station_id: 1,
          station_order: 1,
          arrival_time: "06:30:00",
          departure_time: "06:30:00",
          TrainSchedule: {
            id: 1,
            Train: { train_name: "KA Lodaya", train_code: "77" }
          },
          Station: { station_name: "Bandung", station_code: "BD" }
        },
        {
          id: 2,
          schedule_id: 1,
          station_id: 2,
          station_order: 2,
          arrival_time: "06:39:00",
          departure_time: "06:41:00",
          TrainSchedule: {
            id: 1,
            Train: { train_name: "KA Lodaya", train_code: "77" }
          },
          Station: { station_name: "Kiaracondong", station_code: "KAC" }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const data = await apiService.getAllTrainSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Fallback dummy data
      setSchedules([
        { id: 1, train_id: 1, schedule_date: "2025-01-08", Train: { train_name: "KA Lodaya", train_code: "77" } },
        { id: 2, train_id: 2, schedule_date: "2025-01-08", Train: { train_name: "KA Argo Parahyangan", train_code: "3" } }
      ]);
    }
  };

  const fetchStations = async () => {
    try {
      const data = await apiService.getAllStations();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
      // Fallback dummy data
      setStations([
        { id: 1, station_name: "Bandung", station_code: "BD" },
        { id: 2, station_name: "Kiaracondong", station_code: "KAC" },
        { id: 3, station_name: "Cicalengka", station_code: "CPD" },
        { id: 4, station_name: "Tasikmalaya", station_code: "TSM" }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await apiService.updateScheduleRoute(editingRoute.id, formData);
        alert('Route updated successfully!');
      } else {
        await apiService.createScheduleRoute(formData);
        alert('Route created successfully!');
      }
      
      await fetchRoutes();
      closeForm();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Error saving route data');
    }
  };

  const handleDelete = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await apiService.deleteScheduleRoute(routeId);
        await fetchRoutes();
        alert('Route deleted successfully!');
      } catch (error) {
        console.error('Error deleting route:', error);
        alert('Error deleting route');
      }
    }
  };

  const openForm = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        schedule_id: route.schedule_id,
        station_id: route.station_id,
        station_order: route.station_order,
        arrival_time: route.arrival_time,
        departure_time: route.departure_time
      });
    } else {
      setEditingRoute(null);
      setFormData({
        schedule_id: '',
        station_id: '',
        station_order: '',
        arrival_time: '',
        departure_time: ''
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRoute(null);
  };

  const filteredRoutes = routes.filter(route => {
    const trainName = route.TrainSchedule?.Train?.train_name || '';
    const stationName = route.Station?.station_name || '';
    const search = searchTerm.toLowerCase();
    
    return trainName.toLowerCase().includes(search) ||
           stationName.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <div className="route-management loading">
        <div className="loading-spinner"></div>
        <p>Loading routes...</p>
      </div>
    );
  }

  return (
    <div className="route-management">
      <div className="management-header">
        <div className="header-left">
          <h2>🛤️ Route Management</h2>
          <p>Plan and optimize train routes</p>
        </div>
        <button className="btn-primary" onClick={() => openForm()}>
          ➕ Add New Route
        </button>
      </div>

      <div className="management-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search routes by train or station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-value">{routes.length}</span>
            <span className="stat-label">Total Routes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{new Set(routes.map(r => r.schedule_id)).size}</span>
            <span className="stat-label">Active Schedules</span>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3>{editingRoute ? 'Edit Route' : 'Add New Route'}</h3>
              <button className="close-btn" onClick={closeForm}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="route-form">
              <div className="form-section">
                <h3>Route Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Train Schedule *</label>
                    <select
                      value={formData.schedule_id}
                      onChange={(e) => setFormData({...formData, schedule_id: e.target.value})}
                      required
                    >
                      <option value="">Select Schedule</option>
                      {schedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.Train?.train_name} - {schedule.schedule_date}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Station *</label>
                    <select
                      value={formData.station_id}
                      onChange={(e) => setFormData({...formData, station_id: e.target.value})}
                      required
                    >
                      <option value="">Select Station</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.station_name} ({station.station_code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Station Order *</label>
                    <input
                      type="number"
                      value={formData.station_order}
                      onChange={(e) => setFormData({...formData, station_order: e.target.value})}
                      required
                      min="1"
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Arrival Time *</label>
                    <input
                      type="time"
                      value={formData.arrival_time}
                      onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Departure Time *</label>
                    <input
                      type="time"
                      value={formData.departure_time}
                      onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingRoute ? 'Update Route' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="routes-grid">
        {filteredRoutes.map((route) => (
          <div key={route.id} className="route-card">
            <div className="route-header">
              <div className="route-info">
                <h3>{route.TrainSchedule?.Train?.train_name || 'Unknown Train'}</h3>
                <span className="route-code">#{route.id}</span>
              </div>
              <div className="route-actions">
                <button
                  className="btn-edit"
                  onClick={() => openForm(route)}
                  title="Edit Route"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(route.id)}
                  title="Delete Route"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="route-details">
              <div className="detail-item">
                <span className="label">Train Code:</span>
                <span className="value">
                  {route.TrainSchedule?.Train?.train_code || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Station:</span>
                <span className="value">
                  {route.Station?.station_name || 'Unknown'} ({route.Station?.station_code || 'N/A'})
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Station Order:</span>
                <span className="value order-badge">
                  #{route.station_order}
                </span>
              </div>
            </div>

            <div className="route-schedule">
              <div className="schedule-item">
                <span className="schedule-label">Arrival:</span>
                <span className="schedule-time">{route.arrival_time || 'N/A'}</span>
              </div>
              <div className="schedule-divider">→</div>
              <div className="schedule-item">
                <span className="schedule-label">Departure:</span>
                <span className="schedule-time">{route.departure_time || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">🛤️</div>
          <h3>No routes found</h3>
          <p>
            {searchTerm 
              ? 'No routes match your search criteria' 
              : 'Start by adding your first route'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;