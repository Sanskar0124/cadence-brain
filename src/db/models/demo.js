'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Demo extends Model {
    static associate({ Lead, Cadence }) {
      // define association here
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
      this.belongsTo(Cadence, { foreignKey: 'cadence_id' });
    }
  }

  Demo.init(
    {
      demo_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lem_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      node_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      meeting_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: true,
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      schedule_time: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'demo',
      modelName: 'Demo',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Demo;
};
