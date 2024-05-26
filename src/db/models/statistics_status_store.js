'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Statistics_Status_Store extends Model {
    static associate({ User, Cadence }) {
      this.belongsTo(User, { foreignKey: 'user_id', sourceKey: 'user_id' });
      this.belongsTo(Cadence, {
        foreignKey: 'cadence_id',
        sourceKey: 'cadence_id',
      });
    }
  }

  Statistics_Status_Store.init(
    {
      store_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      timeframe: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      disqualified_count: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      converted_count: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      cadence_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      user_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'statistics_status_store',
      modelName: 'Statistics_Status_Store',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Statistics_Status_Store;
};
