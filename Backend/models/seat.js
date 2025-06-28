'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seat extends Model {
    static associate(models) {
      Seat.belongsTo(models.Carriage, { foreignKey: 'carriage_id' });
      Seat.hasMany(models.Booking, { foreignKey: 'seat_id' });
    }
  }

  Seat.init({
    carriage_id: DataTypes.INTEGER,
    seat_number: DataTypes.STRING(10)
  }, {
    sequelize,
    modelName: 'Seat',
    tableName: 'seats',
    underscored: true
  });

  return Seat;
};
