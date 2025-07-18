import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const TrainScheduleManagement = () => {
  console.log('🔧 TrainScheduleManagement component rendering...');
  
  const [schedules, setSchedules] = useState([]);
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [routes, setRoutes] = useState([]);
  
  // Form data sesuai model Schedule (hanya train_id dan schedule_date)
  const [formData, setFormData] = useState({
    train_id: '',
    schedule_date: ''
  });

  // Form untuk route sesuai model ScheduleRoute
  const [routeForm, setRouteForm] = useState({
    station_id: '',
    station_order: '',
    arrival_time: '',
    departure_time: ''
  });

  useEffect(() => {
    console.log(' useEffect running...');
    fetchSchedules();
    fetchTrains();
    fetchStations();
  }, []);

  const fetchSchedules = async () => {
    try {
      console.log(' Fetching schedules...');
      setLoading(true);
      const data = await apiService.getAllSchedules();
      console.log(' Schedules data:', data);
      setSchedules(data || []);
    } catch (error) {
      console.error(' Error fetching schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrains = async () => {
    try {
      console.log(' Fetching trains...');
      const data = await apiService.getAllTrains();
      console.log(' Trains data:', data);
      setTrains(data || []);
    } catch (error) {
      console.error(' Error fetching trains:', error);
      setTrains([]);
    }
  };

  const fetchStations = async () => {
    try {
      console.log(' Fetching stations...');
      const data = await apiService.getAllStations();
      console.log(' Stations data:', data);
      setStations(data || []);
    } catch (error) {
      console.error(' Error fetching stations:', error);
      setStations([]);
    }
  };

  const fetchRoutes = async (scheduleId) => {
    try {
      console.log(' Fetching routes for schedule:', scheduleId);
      const data = await apiService.getAllScheduleRoutes();
      const filteredRoutes = data?.filter(route => route.schedule_id === scheduleId) || [];
      setRoutes(filteredRoutes.sort((a, b) => a.station_order - b.station_order));
    } catch (error) {
      console.error(' Error fetching routes:', error);
      setRoutes([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRouteInputChange = (e) => {
    const { name, value } = e.target;
    setRouteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit hanya untuk Schedule (train_id dan schedule_date)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(' Submitting schedule:', formData);
      
      if (editingSchedule) {
        await apiService.updateSchedule(editingSchedule.id, formData);
        console.log(' Schedule updated');
      } else {
        await apiService.createSchedule(formData);
        console.log(' Schedule created');
      }
      
      resetForm();
      fetchSchedules();
      alert(editingSchedule ? 'Schedule updated successfully!' : 'Schedule created successfully!');
    } catch (error) {
      console.error(' Error saving schedule:', error);
      alert('Error saving schedule: ' + (error.message || 'Unknown error'));
    }
  };

  // Submit untuk ScheduleRoute
  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(' Submitting route:', routeForm);
      
      const routeData = {
        ...routeForm,
        schedule_id: selectedSchedule.id,
        station_order: parseInt(routeForm.station_order)
      };
      
      await apiService.createScheduleRoute(routeData);
      console.log(' Route created');
      
      setRouteForm({
        station_id: '',
        station_order: '',
        arrival_time: '',
        departure_time: ''
      });
      
      fetchRoutes(selectedSchedule.id);
      alert('Route added successfully!');
    } catch (error) {
      console.error(' Error saving route:', error);
      alert('Error saving route: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      train_id: schedule.train_id || '',
      schedule_date: schedule.schedule_date || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await apiService.deleteSchedule(id);
        fetchSchedules();
        alert('Schedule deleted successfully!');
      } catch (error) {
        console.error(' Error deleting schedule:', error);
        alert('Error deleting schedule');
      }
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await apiService.deleteScheduleRoute(routeId);
        fetchRoutes(selectedSchedule.id);
        alert('Route deleted successfully!');
      } catch (error) {
        console.error(' Error deleting route:', error);
        alert('Error deleting route');
      }
    }
  };

  const handleManageRoutes = (schedule) => {
    setSelectedSchedule(schedule);
    setShowRouteModal(true);
    fetchRoutes(schedule.id);
  };

  const resetForm = () => {
    setFormData({
      train_id: '',
      schedule_date: ''
    });
    setEditingSchedule(null);
    setShowForm(false);
  };

  const getTrainName = (trainId) => {
    const train = trains.find(t => t.id === trainId);
    return train ? `${train.train_name} (${train.train_code})` : 'Unknown Train';
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.station_name : 'Unknown Station';
  };

  const getNextStationOrder = () => {
    return routes.length > 0 ? Math.max(...routes.map(r => r.station_order)) + 1 : 1;
  };

  console.log(' Render state:', { 
    loading, 
    schedulesCount: schedules.length, 
    trainsCount: trains.length,
    stationsCount: stations.length 
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <h3>Loading schedules...</h3>
        <p>Please wait while we fetch the data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}> Train Schedule Management</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
            Schedules: {schedules.length} | Trains: {trains.length} | Stations: {stations.length}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          + Add Schedule
        </button>
      </div>

      {/* Schedule Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</h3>
              <button 
                onClick={resetForm}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              {/* Train Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Select Train:
                </label>
                <select
                  name="train_id"
                  value={formData.train_id}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Choose a train...</option>
                  {trains.map(train => (
                    <option key={train.id} value={train.id}>
                      {train.train_name} ({train.train_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Schedule Date */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Schedule Date:
                </label>
                <input
                  type="date"
                  name="schedule_date"
                  value={formData.schedule_date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {editingSchedule ? 'Update' : 'Save'} Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routes Management Modal */}
      {showRouteModal && selectedSchedule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>
                🛤️ Manage Routes - {getTrainName(selectedSchedule.train_id)}
              </h3>
              <button 
                onClick={() => setShowRouteModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Add Route Form */}
            <form onSubmit={handleRouteSubmit} style={{ 
              marginBottom: '2rem', 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '6px' 
            }}>
              <h4 style={{ marginTop: 0 }}>Add New Route Stop</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Station:
                  </label>
                  <select
                    name="station_id"
                    value={routeForm.station_id}
                    onChange={handleRouteInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Select Station</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.station_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Stop Order:
                  </label>
                  <input
                    type="number"
                    name="station_order"
                    value={routeForm.station_order}
                    onChange={handleRouteInputChange}
                    placeholder={getNextStationOrder().toString()}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Arrival Time:
                  </label>
                  <input
                    type="time"
                    name="arrival_time"
                    value={routeForm.arrival_time}
                    onChange={handleRouteInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Departure Time:
                  </label>
                  <input
                    type="time"
                    name="departure_time"
                    value={routeForm.departure_time}
                    onChange={handleRouteInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Add Stop
              </button>
            </form>

            {/* Routes List */}
            <div>
              <h4>Current Route Stops ({routes.length})</h4>
              {routes.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#666' }}>
                  No route stops added yet. Add stops to define the train's journey.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {routes.map((route, index) => (
                    <div key={route.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: '#007bff',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {route.station_order}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>
                            {getStationName(route.station_id)}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Arr: {route.arrival_time} | Dep: {route.departure_time}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRoute(route.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedules Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Train</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Routes</th>
              <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  No schedules found. Click "Add Schedule" to create one.
                </td>
              </tr>
            ) : (
              schedules.map((schedule, index) => (
                <tr key={schedule.id} style={{ 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    #{schedule.id}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {getTrainName(schedule.train_id)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {schedule.schedule_date}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => handleManageRoutes(schedule)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#17a2b8', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                       Manage Routes
                    </button>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(schedule)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#ffc107',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '0.5rem',
                        fontSize: '0.9rem'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                       Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainScheduleManagement;