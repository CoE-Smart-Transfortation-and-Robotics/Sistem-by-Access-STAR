'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Booking, { foreignKey: 'booking_id' });
    }
  }

  Payment.init({
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    midtrans_order_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    payment_method: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'expired'),
      defaultValue: 'pending'
    },
    snap_token: DataTypes.STRING,
    redirect_url: DataTypes.STRING,
    transaction_time: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    underscored: true
  });

  return Payment;
};
