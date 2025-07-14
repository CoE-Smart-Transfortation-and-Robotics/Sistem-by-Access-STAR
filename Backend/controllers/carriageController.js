const { Carriage, Train, Seat } = require('../models');

module.exports = {
  async getAllCarriages(req, res) {
    try {
      const carriages = await Carriage.findAll({
        include: [
          { model: Train, attributes: ['train_name', 'train_code'] },
          { model: Seat, attributes: ['id', 'seat_number'] }
        ]
      });
      res.json(carriages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch carriages' });
    }
  },

  async getCarriageById(req, res) {
    try {
      const carriage = await Carriage.findByPk(req.params.id, {
        include: [
          { model: Train, attributes: ['train_name', 'train_code'] },
          { model: Seat, attributes: ['id', 'seat_number'] }
        ]
      });
      if (!carriage) return res.status(404).json({ error: 'Carriage not found' });
      res.json(carriage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch carriage' });
    }
  },

  async createCarriage(req, res) {
    try {
      const { train_id, carriage_number, class: carriageClass } = req.body;
      
      if (!train_id || !carriage_number || !carriageClass) {
        return res.status(400).json({ error: 'Train ID, carriage number, and class are required' });
      }

      const newCarriage = await Carriage.create({ 
        train_id, 
        carriage_number, 
        class: carriageClass 
      });
      res.status(201).json(newCarriage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create carriage' });
    }
  },

  async updateCarriage(req, res) {
    try {
      const { train_id, carriage_number, class: carriageClass } = req.body;
      const carriage = await Carriage.findByPk(req.params.id);
      
      if (!carriage) return res.status(404).json({ error: 'Carriage not found' });

      await carriage.update({ 
        train_id, 
        carriage_number, 
        class: carriageClass 
      });
      res.json(carriage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update carriage' });
    }
  },

  async deleteCarriage(req, res) {
    try {
      const carriage = await Carriage.findByPk(req.params.id);
      if (!carriage) return res.status(404).json({ error: 'Carriage not found' });

      await carriage.destroy();
      res.json({ message: 'Carriage deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete carriage' });
    }
  },

  async getCarriagesByTrainId(req, res) {
    try {
      const carriages = await Carriage.findAll({
        where: { train_id: req.params.trainId },
        include: [
          { model: Train, attributes: ['train_name', 'train_code'] },
          { model: Seat, attributes: ['id', 'seat_number'] }
        ]
      });
      res.json(carriages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch carriages for train' });
    }
  }
};
