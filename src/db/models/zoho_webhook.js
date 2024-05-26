'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Zoho_Webhook extends Model {
    static associate({ Company }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
    }
  }
  Zoho_Webhook.init(
    {
      channel_id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'zoho_webhook',
      modelName: 'Zoho_Webhook',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Zoho_Webhook;
};
