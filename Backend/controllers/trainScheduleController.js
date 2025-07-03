const { TrainSchedule, Train } = require('../models');

module.exports = {
  async getAllSchedules(req, res) {
    try {
      const schedules = await TrainSchedule.findAll({
        include: [{ model: Train }]
      });
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  },

  async getScheduleById(req, res) {
    try {
      const schedule = await TrainSchedule.findByPk(req.params.id, {
        include: [{ model: Train }]
      });
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  },

  async createSchedule(req, res) {
    try {
      const { train_id, schedule_date } = req.body;
      const newSchedule = await TrainSchedule.create({ train_id, schedule_date });
      res.status(201).json(newSchedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  },

  async updateSchedule(req, res) {
    try {
      const { train_id, schedule_date } = req.body;
      const schedule = await TrainSchedule.findByPk(req.params.id);
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

      await schedule.update({ train_id, schedule_date });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  },

  async deleteSchedule(req, res) {
    try {
      const schedule = await TrainSchedule.findByPk(req.params.id);
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

      await schedule.destroy();
      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  }
};