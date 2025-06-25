'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Station extends Model {
    static associate(models) {
      Station.hasMany(models.ScheduleRoute, { foreignKey: 'station_id' });
      Station.hasMany(models.Booking, { foreignKey: 'origin_station_id', as: 'OriginStation' });
      Station.hasMany(models.Booking, { foreignKey: 'destination_station_id', as: 'DestinationStation' });
    }
  }

  Station.init({
    station_name: DataTypes.STRING(100),
    station_code: DataTypes.STRING(10)
  }, {
    sequelize,
    modelName: 'Station',
    tableName: 'stations',
    underscored: true
  });

  return Station;
};
