const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }


  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }


  async getProfile() {
    return this.request('/auth/profile'); 
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Train endpoints (berdasarkan backend routes yang ada)
  async getAllTrains() {
    return this.request('/trains');
  }

  async getTrainById(id) {
    return this.request(`/trains/${id}`);
  }

  async createTrain(data) {
    return this.request('/trains', {
      method: 'POST',
      body: data,
    });
  }

  async updateTrain(id, data) {
    return this.request(`/trains/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteTrain(id) {
    return this.request(`/trains/${id}`, {
      method: 'DELETE',
    });
  }

  // Station endpoints (berdasarkan backend routes yang ada)
  async getAllStations() {
    return this.request('/stations');
  }

  async getStationById(id) {
    return this.request(`/stations/${id}`);
  }

  async createStation(data) {
    return this.request('/stations', {
      method: 'POST',
      body: data,
    });
  }

  async updateStation(id, data) {
    return this.request(`/stations/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteStation(id) {
    return this.request(`/stations/${id}`, {
      method: 'DELETE',
    });
  }

  // Train Schedule endpoints (berdasarkan backend routes yang ada)
  async getAllSchedules() {
    return this.request('/train-schedules');
  }

  async getScheduleById(id) {
    return this.request(`/train-schedules/${id}`);
  }

  async createSchedule(data) {
    return this.request('/train-schedules', {
      method: 'POST',
      body: data,
    });
  }

  async updateSchedule(id, data) {
    return this.request(`/train-schedules/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteSchedule(id) {
    return this.request(`/train-schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // Schedule Routes endpoints (berdasarkan backend routes yang ada)
  async getAllScheduleRoutes() {
    return this.request('/schedule-routes');
  }

  async getScheduleRouteById(id) {
    return this.request(`/schedule-routes/${id}`);
  }

  async createScheduleRoute(data) {
    return this.request('/schedule-routes', {
      method: 'POST',
      body: data,
    });
  }

  async updateScheduleRoute(id, data) {
    return this.request(`/schedule-routes/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteScheduleRoute(id) {
    return this.request(`/schedule-routes/${id}`, {
      method: 'DELETE',
    });
  }

  // Train Category endpoints
  async getAllTrainCategories() {
    return this.request('/train-categories');
  }

  async createTrainCategory(data) {
    return this.request('/train-categories', {
      method: 'POST',
      body: data,
    });
  }

  // Carriage endpoints
  async getAllCarriages() {
    return this.request('/carriages');
  }

  async getCarriageById(id) {
    return this.request(`/carriages/${id}`);
  }

  async createCarriage(data) {
    return this.request('/carriages', {
      method: 'POST',
      body: data,
    });
  }

  async updateCarriage(id, data) {
    return this.request(`/carriages/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteCarriage(id) {
    return this.request(`/carriages/${id}`, {
      method: 'DELETE',
    });
  }

  async getCarriagesByTrainId(trainId) {
    return this.request(`/carriages/train/${trainId}`);
  }

  // Seat endpoints
  async getAllSeats() {
    return this.request('/seats');
  }

  async createSeat(data) {
    return this.request('/seats', {
      method: 'POST',
      body: data,
    });
  }

  async createMultipleSeats(data) {
    return this.request('/seats/bulk', {
      method: 'POST',
      body: data,
    });
  }

  async getSeatsByCarriageId(carriageId) {
    return this.request(`/seats/carriage/${carriageId}`);
  }
<<<<<<< Updated upstream

 // =================Train Schedule endpoints======================
  async getAllTrainSchedules() {
    return this.request('/train-schedules');
  }

  async addTrainSchedule(data) {
    return this.request('/train-schedules', {
      method: 'POST',
      body: data,
    });
  }

  async updateTrainSchedule(id, data) {
    return this.request(`/train-schedules/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteTrainSchedule(id) {
    return this.request(`/train-schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // Schedule Routes endpoints
  async getScheduleRoutes(scheduleId) {
    return this.request(`/schedule-routes?schedule_id=${scheduleId}`);
  }

  async addScheduleRoute(data) {
    return this.request('/schedule-routes', {
      method: 'POST',
      body: data,
    });
  }

  async deleteScheduleRoute(id) {
    return this.request(`/schedule-routes/${id}`, {
      method: 'DELETE',
    });
  }

  // Station endpoints
  async getAllStations() {
    return this.request('/stations');
  }

  // Train endpoints
  async getAllTrains() {
    return this.request('/trains');
  }

  //=====================end======================
=======
>>>>>>> Stashed changes
}

export const apiService = new ApiService();