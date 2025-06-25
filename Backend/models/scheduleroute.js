'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScheduleRoute extends Model {
    static associate(models) {
      ScheduleRoute.belongsTo(models.TrainSchedule, { foreignKey: 'schedule_id' });
      ScheduleRoute.belongsTo(models.Station, { foreignKey: 'station_id' });
    }
  }

  ScheduleRoute.init({
    schedule_id: DataTypes.INTEGER,
    station_id: DataTypes.INTEGER,
    station_order: DataTypes.INTEGER,
    arrival_time: DataTypes.TIME,
    departure_time: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'ScheduleRoute',
    tableName: 'schedule_routes',
    underscored: true
  });

  return ScheduleRoute;
};
