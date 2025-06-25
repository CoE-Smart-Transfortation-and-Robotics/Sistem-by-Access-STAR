'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TrainSchedule extends Model {
    static associate(models) {
      TrainSchedule.belongsTo(models.Train, { foreignKey: 'train_id' });
      TrainSchedule.hasMany(models.ScheduleRoute, { foreignKey: 'schedule_id' });
      TrainSchedule.hasMany(models.Booking, { foreignKey: 'schedule_id' });
    }
  }

  TrainSchedule.init({
    train_id: DataTypes.INTEGER,
    schedule_date: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'TrainSchedule',
    tableName: 'train_schedules',
    underscored: true
  });

  return TrainSchedule;
};
