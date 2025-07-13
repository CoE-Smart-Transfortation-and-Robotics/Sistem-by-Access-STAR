const { Seat, Carriage, Train } = require('../models');

module.exports = {
  async getAllSeats(req, res) {
    try {
      const seats = await Seat.findAll({
        include: [
          { 
            model: Carriage, 
            attributes: ['carriage_number', 'class'],
            include: [
              { model: Train, attributes: ['train_name', 'train_code'] }
            ]
          }
        ]
      });
      res.json(seats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch seats' });
    }
  },

  async getSeatById(req, res) {
    try {
      const seat = await Seat.findByPk(req.params.id, {
        include: [
          { 
            model: Carriage, 
            attributes: ['carriage_number', 'class'],
            include: [
              { model: Train, attributes: ['train_name', 'train_code'] }
            ]
          }
        ]
      });
      if (!seat) return res.status(404).json({ error: 'Seat not found' });
      res.json(seat);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch seat' });
    }
  },

  async createSeat(req, res) {
    try {
      const { carriage_id, seat_number } = req.body;
      
      if (!carriage_id || !seat_number) {
        return res.status(400).json({ error: 'Carriage ID and seat number are required' });
      }

      const newSeat = await Seat.create({ carriage_id, seat_number });
      res.status(201).json(newSeat);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create seat' });
    }
  },

  async updateSeat(req, res) {
    try {
      const { carriage_id, seat_number } = req.body;
      const seat = await Seat.findByPk(req.params.id);
      
      if (!seat) return res.status(404).json({ error: 'Seat not found' });

      await seat.update({ carriage_id, seat_number });
      res.json(seat);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update seat' });
    }
  },

  async deleteSeat(req, res) {
    try {
      const seat = await Seat.findByPk(req.params.id);
      if (!seat) return res.status(404).json({ error: 'Seat not found' });

      await seat.destroy();
      res.json({ message: 'Seat deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete seat' });
    }
  },

  async getSeatsByCarriageId(req, res) {
    try {
      const seats = await Seat.findAll({
        where: { carriage_id: req.params.carriageId },
        include: [
          { 
            model: Carriage, 
            attributes: ['carriage_number', 'class'],
            include: [
              { model: Train, attributes: ['train_name', 'train_code'] }
            ]
          }
        ]
      });
      res.json(seats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch seats for carriage' });
    }
  },

  async createMultipleSeats(req, res) {
    try {
      const { carriage_id, seats } = req.body;
      
      if (!carriage_id || !seats || !Array.isArray(seats)) {
        return res.status(400).json({ error: 'Carriage ID and seats array are required' });
      }

      const seatData = seats.map(seat => ({
        carriage_id,
        seat_number: seat.seat_number
      }));

      const newSeats = await Seat.bulkCreate(seatData);
      res.status(201).json(newSeats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create multiple seats' });
    }
  }
};
