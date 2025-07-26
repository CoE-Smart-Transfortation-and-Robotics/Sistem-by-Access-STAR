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

  // Auth endpoints
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

  // ✅ Fix: Ganti endpoint profile sesuai backend
  async getProfile() {
    return this.request('/users/profile/me'); 
  }

  // User endpoints
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

  // Train endpoints
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

  // Station endpoints
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

  // Train Schedule endpoints
  async getAllTrainSchedules() {
    return this.request('/train-schedules');
  }

  // ✅ Fix: Ganti alias method name untuk konsistensi
  async createTrainSchedule(data) {
    return this.request('/train-schedules', {
      method: 'POST',
      body: data,
    });
  }

  async getScheduleById(id) {
    return this.request(`/train-schedules/${id}`);
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

  // ✅ Fix: Hapus duplikasi getAllSchedules
  async getAllSchedules() {
    return this.request('/train-schedules');
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

  // Schedule Routes endpoints
  async getAllScheduleRoutes() {
    return this.request('/schedule-routes');
  }

  async getScheduleRouteById(id) {
    return this.request(`/schedule-routes/${id}`);
  }

  async getScheduleRoutes(scheduleId) {
    return this.request(`/schedule-routes?schedule_id=${scheduleId}`);
  }

  async createScheduleRoute(data) {
    return this.request('/schedule-routes', {
      method: 'POST',
      body: data,
    });
  }

  // ✅ Fix: Ganti alias method name untuk konsistensi
  async addScheduleRoute(data) {
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

  async getTrainCategoryById(id) {
    return this.request(`/train-categories/${id}`);
  }

  async createTrainCategory(data) {
    return this.request('/train-categories', {
      method: 'POST',
      body: data,
    });
  }

  async updateTrainCategory(id, data) {
    return this.request(`/train-categories/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteTrainCategory(id) {
    return this.request(`/train-categories/${id}`, {
      method: 'DELETE',
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

  async getSeatById(id) {
    return this.request(`/seats/${id}`);
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

  async updateSeat(id, data) {
    return this.request(`/seats/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteSeat(id) {
    return this.request(`/seats/${id}`, {
      method: 'DELETE',
    });
  }

  async getSeatsByCarriageId(carriageId) {
    return this.request(`/seats/carriage/${carriageId}`);
  }

  // ✅ Fix: Tambah booking endpoints yang ada di backend
  async getAvailableSeats(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/bookings/available-seats?${queryString}`);
  }

  async createBooking(data) {
    return this.request('/bookings', {
      method: 'POST',
      body: data,
    });
  }

  // ✅ Tambah endpoints yang masih missing:
  async getMyBookings() {
    return this.request('/bookings/mine');
  }

  async getAllBookings() {
    return this.request('/bookings');
  }

  async getBookingById(id) {
    return this.request(`/bookings/${id}`);
  }

  async cancelBooking(id) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async updateBookingStatus(id, status) {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  // ✅ Fix: Tambah train search endpoint
  async searchTrainsByRoute(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/trains/search/route?${queryString}`);
  }

  async getTrainCarriages(trainId) {
    return this.request(`/trains/${trainId}/carriages`);
  }

  async getTrainSchedules(trainId) {
    return this.request(`/trains/${trainId}/schedules`);
  }

  async searchTrainSchedules(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/bookings/schedules?${queryString}`);
  }
}

export const apiService = new ApiService();