const { Station } = require('../models');

module.exports = {
  async getAllStations(req, res) {
    try {
      const stations = await Station.findAll();
      res.json(stations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stations' });
    }
  },

  async getStationById(req, res) {
    try {
      const station = await Station.findByPk(req.params.id);
      if (!station) return res.status(404).json({ error: 'Station not found' });
      res.json(station);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch station' });
    }
  },

  async createStation(req, res) {
    try {
      const { station_name, station_code } = req.body;
      const newStation = await Station.create({ station_name, station_code });
      res.status(201).json(newStation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create station' });
    }
  },

  async updateStation(req, res) {
    try {
      const { station_name, station_code } = req.body;
      const station = await Station.findByPk(req.params.id);
      if (!station) return res.status(404).json({ error: 'Station not found' });

      await station.update({ station_name, station_code });
      res.json(station);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update station' });
    }
  },

  async deleteStation(req, res) {
    try {
      const station = await Station.findByPk(req.params.id);
      if (!station) return res.status(404).json({ error: 'Station not found' });

      await station.destroy();
      res.json({ message: 'Station deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete station' });
    }
  }
};