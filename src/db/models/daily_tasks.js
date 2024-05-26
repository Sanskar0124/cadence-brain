'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Daily_Tasks extends Model {
    static associate({ Task, User, Node }) {
      this.belongsTo(Task, { foreignKey: 'task_id', sourceKey: 'task_id' });
      this.belongsTo(User, { foreignKey: 'user_id', sourceKey: 'user_id' });
      this.belongsTo(Node, { foreignKey: 'node_id', sourceKey: 'node_id' });
    }
  }

  Daily_Tasks.init(
    {
      daily_task_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      node_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'daily_tasks',
      modelName: 'Daily_Tasks',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Daily_Tasks;
};
