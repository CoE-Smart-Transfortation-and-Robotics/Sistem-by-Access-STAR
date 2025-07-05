const { Train, TrainCategory, TrainSchedule, ScheduleRoute, Station } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // 1. Ambil semua kereta (include kategori)
  async getAllTrains(req, res) {
    try {
      const trains = await Train.findAll({
        include: [{ model: TrainCategory }]
      });
      res.json(trains);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch trains' });
    }
  },

  // 2. Ambil detail kereta by ID
  async getTrainById(req, res) {
    try {
      const train = await Train.findByPk(req.params.id, {
        include: [{ model: TrainCategory }]
      });
      if (!train) return res.status(404).json({ error: 'Train not found' });
      res.json(train);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch train' });
    }
  },

  // 3. Buat kereta baru
  async createTrain(req, res) {
    try {
      const { train_name, train_code, category_id } = req.body;
      const newTrain = await Train.create({ train_name, train_code, category_id });
      res.status(201).json(newTrain);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create train' });
    }
  },

  // 4. Update kereta
  async updateTrain(req, res) {
    try {
      const { train_name, train_code, category_id } = req.body;
      const train = await Train.findByPk(req.params.id);
      if (!train) return res.status(404).json({ error: 'Train not found' });

      await train.update({ train_name, train_code, category_id });
      res.json(train);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update train' });
    }
  },

  // 5. Hapus kereta
  async deleteTrain(req, res) {
    try {
      const train = await Train.findByPk(req.params.id);
      if (!train) return res.status(404).json({ error: 'Train not found' });

      await train.destroy();
      res.json({ message: 'Train deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete train' });
    }
  },

  // 6. Improvisasi: Get semua gerbong dari kereta
  async getCarriagesByTrainId(req, res) {
    try {
      const carriages = await Carriage.findAll({ where: { train_id: req.params.id } });
      res.json(carriages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch carriages for train' });
    }
  },

  // 7. Improvisasi: Get semua jadwal dari kereta
  async getSchedulesByTrainId(req, res) {
    try {
      const schedules = await TrainSchedule.findAll({ where: { train_id: req.params.id } });
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedules for train' });
    }
  },

  // 8. Improvisasi: Search kereta berdasarkan rute dan tanggal
  async searchTrains(req, res) {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ error: 'from, to, and date are required' });
    }

    try {
      // Ambil semua ScheduleRoute yg mengandung from dan to
      const routes = await ScheduleRoute.findAll({
        where: {
          station_id: { [Op.in]: [from, to] }
        },
        attributes: ['schedule_id', 'station_id', 'station_order'],
        include: [{ model: Station, attributes: ['station_name'] }]
      });

      const grouped = {};
      for (const route of routes) {
        const sid = route.schedule_id;
        if (!grouped[sid]) grouped[sid] = [];
        grouped[sid].push(route);
      }

      const validScheduleIds = [];
      const stationNameMap = {}; // key: schedule_id, val: { from: '...', to: '...' }

      for (const [schedule_id, items] of Object.entries(grouped)) {
        if (items.length !== 2) continue;
        const [a, b] = items;
        if (a.station_id == from && b.station_id == to && a.station_order < b.station_order) {
          validScheduleIds.push(Number(schedule_id));
          stationNameMap[schedule_id] = {
            from_station_name: a.Station.station_name,
            to_station_name: b.Station.station_name
          };
        }
      }

      const schedules = await TrainSchedule.findAll({
        where: {
          id: { [Op.in]: validScheduleIds },
          schedule_date: date
        },
        include: [{ model: Train, include: [TrainCategory] }]
      });

      const result = schedules.map((s) => {
        const stationInfo = stationNameMap[s.id] || {};
        return {
          id: s.id,
          schedule_date: s.schedule_date,
          train: s.Train,
          from_station_name: stationInfo.from_station_name,
          to_station_name: stationInfo.to_station_name
        };
      });

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to search trains' });
    }
  }
};