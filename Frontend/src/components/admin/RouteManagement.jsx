import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../../styles/admin/RouteManagement.css';

const StationStop = ({ station, isFirst, isLast, isLeft }) => {
  const { Station, arrival_time, departure_time } = station;

  // Komponen Kartu untuk menampilkan detail stasiun
  const Card = (
    <div className={`station-card-wrapper ${isLeft ? 'station-left' : 'station-right'}`}>
      <div className="station-card">
        <div className="station-header">
          <h3 className="station-name">{Station?.station_name}</h3>
          <span className="station-code">{Station?.station_code}</span>
        </div>
        <div className="station-times">
          {arrival_time && (
            <div className="time-detail">
              <span className="time-label">Tiba:</span>
              <span className="time-value">{arrival_time.slice(0, 5)} WIB</span>
            </div>
          )}
          {departure_time && (
            <div className="time-detail">
              <span className="time-label">Berangkat:</span>
              <span className="time-value">{departure_time.slice(0, 5)} WIB</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Placeholder untuk sisi yang kosong
  const Placeholder = <div className="station-placeholder"></div>;

  return (
    <div className="station-stop-container">
      {/* Menentukan posisi kartu (kiri) atau placeholder berdasarkan prop isLeft */}
      {isLeft ? Card : Placeholder}
      
      {/* Titik di tengah timeline */}
      <div className="timeline-dot-container">
        <div className={`timeline-dot ${isFirst || isLast ? 'timeline-dot-special' : 'timeline-dot-regular'}`}>
          <div className="dot-inner"></div>
        </div>
      </div>

      {/* Menentukan posisi placeholder atau kartu (kanan) */}
      {isLeft ? Placeholder : Card}
    </div>
  );
};

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    schedule_id: '',
    routes: [
      {
        station_id: '',
        station_order: 1,
        arrival_time: '',
        departure_time: ''
      }
    ]
  });

  // Group routes by schedule_id
  const groupedRoutes = routes.reduce((acc, route) => {
    const scheduleId = route.schedule_id;
    if (!acc[scheduleId]) {
      acc[scheduleId] = [];
    }
    acc[scheduleId].push(route);
    return acc;
  }, {});

  // Sort and process grouped routes
  const processedSchedules = Object.keys(groupedRoutes).map(scheduleId => {
    const scheduleRoutes = groupedRoutes[scheduleId];
    
    // Sort by station_order
    const sortedRoutes = scheduleRoutes.sort((a, b) => a.station_order - b.station_order);
    
    // Get first departure time and last arrival time
    const firstRoute = sortedRoutes[0];
    const lastRoute = sortedRoutes[sortedRoutes.length - 1];
    
    return {
      schedule_id: scheduleId,
      schedule_info: firstRoute.TrainSchedule,
      routes: sortedRoutes,
      start_time: firstRoute.departure_time || firstRoute.arrival_time,
      end_time: lastRoute.arrival_time || lastRoute.departure_time,
      start_station: firstRoute.Station,
      end_station: lastRoute.Station,
      total_stations: sortedRoutes.length
    };
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
          arrival_time: null,
          departure_time: "06:30:00",
          TrainSchedule: {
            id: 1,
            schedule_date: "2025-01-08",
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
            schedule_date: "2025-01-08",
            Train: { train_name: "KA Lodaya", train_code: "77" }
          },
          Station: { station_name: "Kiaracondong", station_code: "KAC" }
        },
        {
          id: 3,
          schedule_id: 1,
          station_id: 3,
          station_order: 3,
          arrival_time: "08:21:00",
          departure_time: "08:31:00",
          TrainSchedule: {
            id: 1,
            schedule_date: "2025-01-08",
            Train: { train_name: "KA Lodaya", train_code: "77" }
          },
          Station: { station_name: "Cicalengka", station_code: "CPD" }
        },
        {
          id: 4,
          schedule_id: 1,
          station_id: 4,
          station_order: 4,
          arrival_time: "13:12:00",
          departure_time: null,
          TrainSchedule: {
            id: 1,
            schedule_date: "2025-01-08",
            Train: { train_name: "KA Lodaya", train_code: "77" }
          },
          Station: { station_name: "Tasikmalaya", station_code: "TSM" }
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
      setStations([
        { id: 1, station_name: "Bandung", station_code: "BD" },
        { id: 2, station_name: "Kiaracondong", station_code: "KAC" },
        { id: 3, station_name: "Cicalengka", station_code: "CPD" },
        { id: 4, station_name: "Tasikmalaya", station_code: "TSM" }
      ]);
    }
  };

  // Validation functions
  const validateTimeSequence = (routes) => {
    const errors = [];
    
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      
      // Check if arrival_time is before departure_time for the same station
      if (route.arrival_time && route.departure_time) {
        if (route.arrival_time >= route.departure_time) {
          errors.push(`Station ${i + 1}: Arrival time must be before departure time`);
        }
      }
      
      // Check if current station's times are after previous station's times
      if (i > 0) {
        const prevRoute = routes[i - 1];
        const currentTime = route.arrival_time || route.departure_time;
        const prevTime = prevRoute.departure_time || prevRoute.arrival_time;
        
        if (currentTime && prevTime && currentTime <= prevTime) {
          errors.push(`Station ${i + 1}: Times must be after previous station's times`);
        }
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate time sequence
    const errors = validateTimeSequence(formData.routes);
    if (errors.length > 0) {
      alert('Time validation errors:\n' + errors.join('\n'));
      return;
    }

    try {
      if (editingRoute) {
        // Update existing routes
        for (const route of formData.routes) {
          if (route.id) {
            await apiService.updateScheduleRoute(route.id, {
              schedule_id: formData.schedule_id,
              station_id: route.station_id,
              station_order: route.station_order,
              arrival_time: route.arrival_time || null,
              departure_time: route.departure_time || null
            });
          } else {
            await apiService.createScheduleRoute({
              schedule_id: formData.schedule_id,
              station_id: route.station_id,
              station_order: route.station_order,
              arrival_time: route.arrival_time || null,
              departure_time: route.departure_time || null
            });
          }
        }
        alert('Routes updated successfully!');
      } else {
        // Create new routes
        for (const route of formData.routes) {
          await apiService.createScheduleRoute({
            schedule_id: formData.schedule_id,
            station_id: route.station_id,
            station_order: route.station_order,
            arrival_time: route.arrival_time || null,
            departure_time: route.departure_time || null
          });
        }
        alert('Routes created successfully!');
      }
      
      await fetchRoutes();
      closeForm();
    } catch (error) {
      console.error('Error saving routes:', error);
      alert('Error saving route data');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete all routes for this schedule?')) {
      try {
        const routesToDelete = routes.filter(route => route.schedule_id == scheduleId);
        
        for (const route of routesToDelete) {
          await apiService.deleteScheduleRoute(route.id);
        }
        
        await fetchRoutes();
        alert('Routes deleted successfully!');
      } catch (error) {
        console.error('Error deleting routes:', error);
        alert('Error deleting routes');
      }
    }
  };

  const openForm = (schedule = null) => {
    if (schedule) {
      setEditingRoute(schedule);
      const scheduleRoutes = schedule.routes.map(route => ({
        id: route.id,
        station_id: route.station_id,
        station_order: route.station_order,
        arrival_time: route.arrival_time || '',
        departure_time: route.departure_time || ''
      }));
      
      setFormData({
        schedule_id: schedule.schedule_id,
        routes: scheduleRoutes
      });
    } else {
      setEditingRoute(null);
      setFormData({
        schedule_id: '',
        routes: [
          {
            station_id: '',
            station_order: 1,
            arrival_time: '',
            departure_time: ''
          }
        ]
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRoute(null);
  };

  const showScheduleDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedSchedule(null);
  };

  const addRoute = () => {
    setFormData({
      ...formData,
      routes: [
        ...formData.routes,
        {
          station_id: '',
          station_order: formData.routes.length + 1,
          arrival_time: '',
          departure_time: ''
        }
      ]
    });
  };

  const removeRoute = (index) => {
    const newRoutes = formData.routes.filter((_, i) => i !== index);
    // Reorder station_order
    const reorderedRoutes = newRoutes.map((route, i) => ({
      ...route,
      station_order: i + 1
    }));
    setFormData({ ...formData, routes: reorderedRoutes });
  };

  const updateRoute = (index, field, value) => {
    const newRoutes = [...formData.routes];
    newRoutes[index][field] = value;
    setFormData({ ...formData, routes: newRoutes });
  };

  const filteredSchedules = processedSchedules.filter(schedule => {
    const trainName = schedule.schedule_info?.Train?.train_name || '';
    const trainCode = schedule.schedule_info?.Train?.train_code || '';
    const search = searchTerm.toLowerCase();
    
    return trainName.toLowerCase().includes(search) ||
           trainCode.toLowerCase().includes(search);
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
          <div className="header-title">
            <span className="header-icon">🛤️</span>
            <h2>Route Management</h2>
          </div>
          <p>Plan and optimize train routes by schedule</p>
        </div>
        <div className="header-right">
          <button className="btn-primary" onClick={() => openForm()}>
            <span className="btn-icon">➕</span>
            <span className="btn-text">Add New Route Schedule</span>
          </button>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search routes by train name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-value">{processedSchedules.length}</span>
            <span className="stat-label" style={{ color: processedSchedules.length > 0 ? '#1e293b' : '#64748b' }}>Active Schedules</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{routes.length}</span>
            <span className="stat-label" style={{ color: routes.length > 0 ? '#1e293b' : '#64748b' }}>Total Routes</span>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-container large">
            <div className="form-body">
              {/* Schedule Selection Section */}
              <div className="form-section schedule-selection">
                <div className="section-header">
                  <div className="section-title">
                    <span className="section-icon">🚆</span>
                    <h4>Schedule Information</h4>
                  </div>
                  <button className="close-btn" onClick={closeForm}>✕</button>
                </div>
                
                <div className="schedule-selector">
                  <div className="form-group">
                    <label>Select Train Schedule *</label>
                    <select
                      value={formData.schedule_id}
                      onChange={(e) => setFormData({...formData, schedule_id: e.target.value})}
                      required
                      disabled={editingRoute}
                      className={editingRoute ? 'disabled' : ''}
                    >
                      <option value="">Choose a train schedule...</option>
                      {schedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.Train?.train_name} ({schedule.Train?.train_code}) - {schedule.schedule_date}
                        </option>
                      ))}
                    </select>
                    {editingRoute && (
                      <span className="form-note">Schedule cannot be changed when editing routes</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Routes Configuration Section */}
              <form onSubmit={handleSubmit} className="route-form">
                <div className="form-section routes-section">
                  <div className="section-header">
                    <div className="section-title">
                      <span className="section-icon">🛤️</span>
                      <h4>Station Routes Configuration</h4>
                    </div>
                    <button type="button" className="btn-add-route" onClick={addRoute}>
                      <span className="btn-icon">➕</span>
                      <span className="btn-text">Add Station</span>
                    </button>
                  </div>
                  
                  <div className="routes-container">
                    {formData.routes.map((route, index) => (
                      <div key={index} className="route-item">
                        <div className="route-item-header">
                          <div className="route-number">
                            <span className="route-badge">{route.station_order}</span>
                            <h5>Station #{route.station_order}</h5>
                          </div>
                          {formData.routes.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-route"
                              onClick={() => removeRoute(index)}
                              title="Remove this station"
                            >
                              <span>🗑️</span>
                            </button>
                          )}
                        </div>
                        
                        <div className="route-item-content">
                          <div className="form-grid">
                            <div className="form-group station-selector">
                              <label>Station *</label>
                              <select
                                value={route.station_id}
                                onChange={(e) => updateRoute(index, 'station_id', e.target.value)}
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
                            
                            <div className="form-group time-input">
                              <label>
                                Arrival Time 
                                {index === 0 ? (
                                  <span className="optional-badge">Optional</span>
                                ) : (
                                  <span className="required-badge">Required</span>
                                )}
                              </label>
                              <input
                                type="time"
                                value={route.arrival_time}
                                onChange={(e) => updateRoute(index, 'arrival_time', e.target.value)}
                                required={index > 0}
                                placeholder="HH:MM"
                              />
                            </div>
                            
                            <div className="form-group time-input">
                              <label>
                                Departure Time 
                                {index === formData.routes.length - 1 ? (
                                  <span className="optional-badge">Optional</span>
                                ) : (
                                  <span className="required-badge">Required</span>
                                )}
                              </label>
                              <input
                                type="time"
                                value={route.departure_time}
                                onChange={(e) => updateRoute(index, 'departure_time', e.target.value)}
                                required={index < formData.routes.length - 1}
                                placeholder="HH:MM"
                              />
                            </div>
                          </div>
                      
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    <span className="btn-icon">{editingRoute ? '✓' : '+'}</span>
                    <span className="btn-text">
                      {editingRoute ? 'Update Schedule Routes' : 'Create Schedule Routes'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Detail Modal */}
      {showDetail && selectedSchedule && (
        <div className="form-overlay">
          <div className="detail-container">
            <div className="detail-header">
              <h3>Route Detail - {selectedSchedule.schedule_info?.Train?.train_name}</h3>
              <button className="close-btn" onClick={closeDetail}>✕</button>
            </div>
            
            <div className="detail-content">
              <div className="schedule-info">
                <div className="info-item">
                  <span className="label">Train:</span>
                  <span className="value">{selectedSchedule.schedule_info?.Train?.train_name} ({selectedSchedule.schedule_info?.Train?.train_code})</span>
                </div>
                <div className="info-item">
                  <span className="label">Date:</span>
                  <span className="value">{selectedSchedule.schedule_info?.schedule_date}</span>
                </div>
                <div className="info-item">
                  <span className="label">Total Stations:</span>
                  <span className="value">{selectedSchedule.total_stations}</span>
                </div>
              </div>
              <div className="route-timeline">
                <h4>Route Timeline</h4>
                <div className="timeline-container">
                  {/* Timeline Vertical Line */}
                  <div className="timeline-vertical-line"></div>
                  
                  <div className="timeline-stations">
                    {selectedSchedule.routes.map((route, index) => (
                      <StationStop
                        key={route.id}
                        station={route}
                        isFirst={index === 0}
                        isLast={index === selectedSchedule.routes.length - 1}
                        isLeft={index % 2 === 0}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Cards */}
      <div className="schedules-grid">
        {filteredSchedules.map((schedule) => (
          <div key={schedule.schedule_id} className="schedule-card">
            <div className="schedule-header">
              <div className="schedule-info">
                <h3>{schedule.schedule_info?.Train?.train_name || 'Unknown Train'}</h3>
                <span className="schedule-code">{schedule.schedule_info?.Train?.train_code}</span>
              </div>
              <div className="schedule-actions">
                <button
                  className="btn-view"
                  onClick={() => showScheduleDetail(schedule)}
                  title="View Details"
                >
                  👁️
                </button>
                <button
                  className="btn-edit"
                  onClick={() => openForm(schedule)}
                  title="Edit Schedule"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(schedule.schedule_id)}
                  title="Delete Schedule"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="schedule-details">
              <div className="detail-item">
                <span className="label">Date:</span>
                <span className="value">{schedule.schedule_info?.schedule_date}</span>
              </div>
              <div className="detail-item">
                <span className="label">Stations:</span>
                <span className="value">{schedule.total_stations} stops</span>
              </div>
            </div>

            <div className="schedule-route">
              <div className="route-summary">
                <div className="route-start">
                  <span className="station-name">{schedule.start_station?.station_name}</span>
                  <span className="station-code">({schedule.start_station?.station_code})</span>
                  <span className="time">{schedule.start_time}</span>
                </div>
                <div className="route-arrow">→</div>
                <div className="route-end">
                  <span className="station-name">{schedule.end_station?.station_name}</span>
                  <span className="station-code">({schedule.end_station?.station_code})</span>
                  <span className="time">{schedule.end_time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">🛤️</div>
          <h3>No route schedules found</h3>
          <p>
            {searchTerm 
              ? 'No schedules match your search criteria' 
              : 'Start by adding your first route schedule'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;