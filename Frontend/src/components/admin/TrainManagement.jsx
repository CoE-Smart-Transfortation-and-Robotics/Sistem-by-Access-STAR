import { useState, useEffect } from 'react';
import {apiService} from '../../services/api';
import '../../styles/admin/TrainManagement.css';

const TrainManagement = () => {
  const [trains, setTrains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    train_name: '',
    train_code: '',
    category_id: '',
    carriages: [
      {
        carriage_number: 1,
        class: 'Ekonomi',
        seat_count: 60
      }
    ]
  });

  const classOptions = ['Ekonomi', 'Bisnis', 'Eksekutif'];
  const defaultCategories = [
    { id: 1, category_name: 'Antar Kota' },
    { id: 2, category_name: 'Lokal Kota' }
  ];

  useEffect(() => {
    fetchTrains();
    fetchCategories();
  }, []);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllTrains();
      setTrains(data);
    } catch (error) {
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.getAllTrainCategories();
      setCategories(data.length > 0 ? data : defaultCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(defaultCategories);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrain) {
        await apiService.updateTrain(editingTrain.id, {
          train_name: formData.train_name,
          train_code: formData.train_code,
          category_id: formData.category_id
        });
        
        // Update carriages
        for (const carriage of formData.carriages) {
          if (carriage.id) {
            await apiService.updateCarriage(carriage.id, {
              train_id: editingTrain.id,
              carriage_number: carriage.carriage_number,
              class: carriage.class
            });
          } else {
            const newCarriage = await apiService.createCarriage({
              train_id: editingTrain.id,
              carriage_number: carriage.carriage_number,
              class: carriage.class
            });
            
            // Create seats for new carriage
            await createSeatsForCarriage(newCarriage.id, carriage.seat_count);
          }
        }
      } else {
        const newTrain = await apiService.createTrain({
          train_name: formData.train_name,
          train_code: formData.train_code,
          category_id: formData.category_id
        });

        // Create carriages and seats
        for (const carriage of formData.carriages) {
          const newCarriage = await apiService.createCarriage({
            train_id: newTrain.id,
            carriage_number: carriage.carriage_number,
            class: carriage.class
          });
          
          await createSeatsForCarriage(newCarriage.id, carriage.seat_count);
        }
      }

      await fetchTrains();
      closeForm();
    } catch (error) {
      console.error('Error saving train:', error);
      alert('Error saving train data');
    }
  };

  const createSeatsForCarriage = async (carriageId, seatCount) => {
    const seats = [];
    const rows = Math.ceil(seatCount / 4);
    const seatLetters = ['A', 'B', 'C', 'D'];
    
    for (let row = 1; row <= rows; row++) {
      for (let i = 0; i < 4 && seats.length < seatCount; i++) {
        seats.push({
          seat_number: `${row}${seatLetters[i]}`
        });
      }
    }

    await apiService.createMultipleSeats({
      carriage_id: carriageId,
      seats: seats
    });
  };

  const handleDelete = async (trainId) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      try {
        await apiService.deleteTrain(trainId);
        await fetchTrains();
      } catch (error) {
        console.error('Error deleting train:', error);
        alert('Error deleting train');
      }
    }
  };

  const openForm = (train = null) => {
    if (train) {
      setEditingTrain(train);
      setFormData({
        train_name: train.train_name,
        train_code: train.train_code,
        category_id: train.category_id,
        carriages: train.Carriages || [
          {
            carriage_number: 1,
            class: 'Ekonomi',
            seat_count: 60
          }
        ]
      });
    } else {
      setEditingTrain(null);
      setFormData({
        train_name: '',
        train_code: '',
        category_id: '',
        carriages: [
          {
            carriage_number: 1,
            class: 'Ekonomi',
            seat_count: 60
          }
        ]
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTrain(null);
  };

  const addCarriage = () => {
    setFormData({
      ...formData,
      carriages: [
        ...formData.carriages,
        {
          carriage_number: formData.carriages.length + 1,
          class: 'Ekonomi',
          seat_count: 60
        }
      ]
    });
  };

  const removeCarriage = (index) => {
    const newCarriages = formData.carriages.filter((_, i) => i !== index);
    setFormData({ ...formData, carriages: newCarriages });
  };

  const updateCarriage = (index, field, value) => {
    const newCarriages = [...formData.carriages];
    newCarriages[index][field] = value;
    setFormData({ ...formData, carriages: newCarriages });
  };

  const filteredTrains = trains.filter(train =>
    train.train_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.train_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="train-management loading">
        <div className="loading-spinner"></div>
        <p>Loading trains...</p>
      </div>
    );
  }

  return (
    <div className="train-management">
      <div className="management-header">
        <div className="header-left">
          <h2>🚂 Train Management</h2>
          <p>Manage train fleet and configurations</p>
        </div>
        <button className="btn-primary" onClick={() => openForm()}>
          ➕ Add New Train
        </button>
      </div>

      <div className="management-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search trains by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3>{editingTrain ? 'Edit Train' : 'Add New Train'}</h3>
              <button className="close-btn" onClick={closeForm}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="train-form">
              <div className="form-section">
                <h3>Train Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Train Name *</label>
                    <input
                      type="text"
                      value={formData.train_name}
                      onChange={(e) => setFormData({...formData, train_name: e.target.value})}
                      required
                      placeholder="e.g., Argo Bromo Anggrek"
                    />
                  </div>
                  <div className="form-group">
                    <label>Train Code *</label>
                    <input
                      type="text"
                      value={formData.train_code}
                      onChange={(e) => setFormData({...formData, train_code: e.target.value})}
                      required
                      placeholder="e.g., ABA"
                      maxLength="10"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h3>Carriages Configuration</h3>
                  <button type="button" className="btn-secondary" onClick={addCarriage}>
                    ➕ Add Carriage
                  </button>
                </div>
                
                <div className="carriages-form">
                  {formData.carriages.map((carriage, index) => (
                    <div key={index} className="carriage-form">
                      <div className="carriage-header">
                        <h4>Carriage #{carriage.carriage_number}</h4>
                        {formData.carriages.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeCarriage(index)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Carriage Number</label>
                          <input
                            type="number"
                            value={carriage.carriage_number}
                            onChange={(e) => updateCarriage(index, 'carriage_number', parseInt(e.target.value))}
                            min="1"
                          />
                        </div>
                        <div className="form-group">
                          <label>Class</label>
                          <select
                            value={carriage.class}
                            onChange={(e) => updateCarriage(index, 'class', e.target.value)}
                          >
                            {classOptions.map((classOption) => (
                              <option key={classOption} value={classOption}>
                                {classOption}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Seat Count</label>
                          <input
                            type="number"
                            value={carriage.seat_count}
                            onChange={(e) => updateCarriage(index, 'seat_count', parseInt(e.target.value))}
                            min="1"
                            max="100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTrain ? 'Update Train' : 'Create Train'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="trains-grid">
        {filteredTrains.map((train) => (
          <div key={train.id} className="train-card">
            <div className="train-header">
              <div className="train-info">
                <h3>{train.train_name}</h3>
                <span className="train-code">{train.train_code}</span>
              </div>
              <div className="train-actions">
                <button
                  className="btn-edit"
                  onClick={() => openForm(train)}
                  title="Edit Train"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(train.id)}
                  title="Delete Train"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="train-details">
              <div className="detail-item">
                <span className="label">Category:</span>
                <span className="value">
                  {train.TrainCategory?.category_name || 'Unknown'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Carriages:</span>
                <span className="value">
                  {train.Carriages?.length || 0} cars
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Total Seats:</span>
                <span className="value">
                  {train.Carriages?.reduce((total, car) => 
                    total + (car.Seats?.length || 0), 0
                  ) || 0} seats
                </span>
              </div>
            </div>

            {train.Carriages && train.Carriages.length > 0 && (
              <div className="carriages-preview">
                <h4>Carriages Configuration:</h4>
                <div className="carriages-list">
                  {train.Carriages.map((carriage) => (
                    <div key={carriage.id} className="carriage-item">
                      <span className="carriage-number">#{carriage.carriage_number}</span>
                      <span className="carriage-class">{carriage.class}</span>
                      <span className="carriage-seats">
                        {carriage.Seats?.length || 0} seats
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTrains.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">🚂</div>
          <h3>No trains found</h3>
          <p>
            {searchTerm 
              ? 'No trains match your search criteria' 
              : 'Start by adding your first train'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainManagement;