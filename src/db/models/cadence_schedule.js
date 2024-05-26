'use strict';
// Packages
const { Model } = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, Sequelize) => {
  class Cadence_Schedule extends Model {
    static associate({ Cadence }) {
      this.belongsTo(Cadence, {
        foreignKey: 'cadence_id',
        onDelete: 'cascade',
      });
    }
  }
  Cadence_Schedule.init(
    {
      cadence_schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      launch_at: {
        type: Sequelize.STRING,
        allowNull: false,
        autoIncrement: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        unique: true,
      },
    },
    {
      sequelize,
      tableName: 'cadence_schedule',
      modelName: 'Cadence_Schedule',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Cadence_Schedule;
};
