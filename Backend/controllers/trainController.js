const { Train, TrainCategory } = require('../models');

module.exports = {
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

  async createTrain(req, res) {
    try {
      const { train_name, train_code, category_id } = req.body;
      const newTrain = await Train.create({ train_name, train_code, category_id });
      res.status(201).json(newTrain);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create train' });
    }
  },

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

  async deleteTrain(req, res) {
    try {
      const train = await Train.findByPk(req.params.id);
      if (!train) return res.status(404).json({ error: 'Train not found' });

      await train.destroy();
      res.json({ message: 'Train deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete train' });
    }
  }
};