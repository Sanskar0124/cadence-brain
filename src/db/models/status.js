'use strict';

// Utils
const { LEAD_STATUS } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Status extends Model {
    static associate({ Lead }) {
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
    }
  }
  Status.init(
    {
      status_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM,
        values: Object.values(LEAD_STATUS),
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'status',
      modelName: 'Status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Status;
};
