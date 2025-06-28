'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Train extends Model {
    static associate(models) {
      Train.belongsTo(models.TrainCategory, { foreignKey: 'category_id' });
      Train.hasMany(models.Carriage, { foreignKey: 'train_id' });
      Train.hasMany(models.TrainSchedule, { foreignKey: 'train_id' });
    }
  }

  Train.init({
    train_name: DataTypes.STRING(100),
    train_code: DataTypes.STRING(10),
    category_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Train',
    tableName: 'trains',
    underscored: true
  });

  return Train;
};
