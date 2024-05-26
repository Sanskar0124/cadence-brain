'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Node extends Model {
    static associate({
      Cadence,
      Task,
      Activity,
      Email,
      Daily_Tasks,
      LeadToCadence,
    }) {
      this.belongsTo(Cadence, {
        foreignKey: 'cadence_id',
        onDelete: 'CASCADE',
        hooks: true,
      });
      this.hasMany(Task, { foreignKey: 'node_id' });
      this.hasMany(Activity, { foreignKey: 'node_id' });
      this.hasMany(Email, { foreignKey: 'node_id' });
      this.hasOne(Daily_Tasks, { foreignKey: 'node_id', sourceKey: 'node_id' });
      this.hasMany(LeadToCadence, {
        sourceKey: 'node_id',
        foreignKey: 'status_node_id',
      });
    }
  }
  Node.init(
    {
      node_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        // * Validate this with enum while creating node
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_urgent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_first: {
        // * To Fetch first node in order to build sequence of nodes for a cadence
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      step_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      next_node_id: {
        type: Sequelize.INTEGER,
        // * For last node it will be null
        allowNull: true,
      },
      data: {
        // * This will hold data for the node
        type: Sequelize.JSON,
        allowNull: false,
      },
      wait_time: {
        /**
         * * This will be stored in minutes,
         * * and will be used to calculate start_time for the task created from this node
         */
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'node',
      modelName: 'Node',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Node;
};
