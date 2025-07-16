'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: 'user_id' });
      Booking.belongsTo(models.TrainSchedule, { foreignKey: 'schedule_id' });
      Booking.belongsTo(models.Station, { foreignKey: 'origin_station_id', as: 'OriginStation' });
      Booking.belongsTo(models.Station, { foreignKey: 'destination_station_id', as: 'DestinationStation' });
      Booking.hasOne(models.Payment, { foreignKey: 'booking_id' });
      Booking.hasMany(models.BookingPassenger, {
        foreignKey: 'booking_id',
        as: 'passengers',
      });
    }
  }

  Booking.init({
    user_id: DataTypes.INTEGER,
    schedule_id: DataTypes.INTEGER,
    origin_station_id: DataTypes.INTEGER,
    destination_station_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      defaultValue: 'pending'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    },
    booking_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    underscored: true
  });

  return Booking;
};