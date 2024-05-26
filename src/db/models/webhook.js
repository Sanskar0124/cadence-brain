'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Webhook extends Model {
    static associate({ Company_Settings }) {
      this.belongsTo(Company_Settings, { foreignKey: 'company_settings_id' });
    }
  }
  Webhook.init(
    {
      webhook_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      webhook_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      http_method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_status: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      object_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      url: {
        type: Sequelize.STRING(3000),
        allowNull: false,
      },
      company_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      auth_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'webhook',
      modelName: 'Webhook',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Webhook;
};
