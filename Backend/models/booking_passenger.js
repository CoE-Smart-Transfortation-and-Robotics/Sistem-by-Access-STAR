"use strict";
module.exports = (sequelize, DataTypes) => {
  const BookingPassenger = sequelize.define("BookingPassenger", {
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nik: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    seat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'booking_passengers',
    underscored: true,
  });

  BookingPassenger.associate = function(models) {
    BookingPassenger.belongsTo(models.Booking, {
      foreignKey: 'booking_id',
      onDelete: 'CASCADE',
    });
    BookingPassenger.belongsTo(models.Seat, {
      foreignKey: 'seat_id',
      onDelete: 'CASCADE',
    });
  };

  return BookingPassenger;
};