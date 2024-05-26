'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Automated_Tasks extends Model {
    static associate({ User, Task }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Task, { foreignKey: 'task_id' });
    }
  }
  Automated_Tasks.init(
    {
      at_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      added: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      start_time: {
        /**
         * time at which this task should be executed
         * this will be stored as unix timestamp
         */
        type: Sequelize.BIGINT,
        allownull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'automated_tasks',
      modelName: 'Automated_Tasks',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Automated_Tasks;
};
