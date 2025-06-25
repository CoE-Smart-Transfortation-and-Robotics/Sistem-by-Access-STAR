'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Booking, { foreignKey: 'user_id' });
    }
  }

  User.init({
    name: DataTypes.STRING(100),
    email: {
      type: DataTypes.STRING(100),
      unique: true
    },
    password: DataTypes.STRING(255),
    phone: DataTypes.STRING(20),
    role: {
      type: DataTypes.ENUM('admin', 'visitor', 'user'),
      defaultValue: 'user'
    },
    nik: DataTypes.STRING(20),
    address: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true
  });

  return User;
};
