'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TrainCategory extends Model {
    static associate(models) {
      TrainCategory.hasMany(models.Train, { foreignKey: 'category_id' });
    }
  }

  TrainCategory.init({
    category_name: DataTypes.STRING(50)
  }, {
    sequelize,
    modelName: 'TrainCategory',
    tableName: 'train_categories',
    underscored: true
  });

  return TrainCategory;
};
