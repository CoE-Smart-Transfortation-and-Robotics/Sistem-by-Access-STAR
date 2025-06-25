'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Carriage extends Model {
    static associate(models) {
      Carriage.belongsTo(models.Train, { foreignKey: 'train_id' });
      Carriage.hasMany(models.Seat, { foreignKey: 'carriage_id' });
    }
  }

  Carriage.init({
    train_id: DataTypes.INTEGER,
    carriage_number: DataTypes.INTEGER,
    class: DataTypes.STRING(20)
  }, {
    sequelize,
    modelName: 'Carriage',
    tableName: 'carriages',
    underscored: true
  });

  return Carriage;
};
