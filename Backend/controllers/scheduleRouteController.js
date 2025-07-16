"use strict";
const { ScheduleRoute, TrainSchedule, Station, Train } = require('../models');

module.exports = {
  async getAllScheduleRoutes(req, res) {
    try {
      const routes = await ScheduleRoute.findAll({
        include: [
          {
            model: TrainSchedule,
            include: [
              {
                model: Train,
                attributes: ['id', 'train_name', 'train_code']
              }
            ]
          },
          Station
        ]
      });
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule routes' });
    }
  },

  async getScheduleRouteById(req, res) {
    try {
      const route = await ScheduleRoute.findByPk(req.params.id, {
        include: [
          {
            model: TrainSchedule,
            include: [
              {
                model: Train,
                attributes: ['id', 'train_name', 'train_code']
              }
            ]
          },
          Station
        ]
      });
      if (!route) {
        return res.status(404).json({ error: 'Schedule route not found' });
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule route' });
    }
  },

  async createScheduleRoute(req, res) {
    try {
      const { schedule_id, station_id, station_order, arrival_time, departure_time } = req.body;
      const newRoute = await ScheduleRoute.create({
        schedule_id,
        station_id,
        station_order,
        arrival_time,
        departure_time
      });
      res.status(201).json(newRoute);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create schedule route' });
    }
  },

  async updateScheduleRoute(req, res) {
    try {
      const route = await ScheduleRoute.findByPk(req.params.id);
      if (!route) {
        return res.status(404).json({ error: 'Schedule route not found' });
      }
      const { schedule_id, station_id, station_order, arrival_time, departure_time } = req.body;
      await route.update({
        schedule_id,
        station_id,
        station_order,
        arrival_time,
        departure_time
      });
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update schedule route' });
    }
  },

  async deleteScheduleRoute(req, res) {
    try {
      const route = await ScheduleRoute.findByPk(req.params.id);
      if (!route) {
        return res.status(404).json({ error: 'Schedule route not found' });
      }
      await route.destroy();
      res.json({ message: 'Schedule route deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schedule route' });
    }
  }
};