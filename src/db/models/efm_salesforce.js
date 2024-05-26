'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class EFM_Salesforce extends Model {
    static associate({ Company_Settings }) {
      this.belongsTo(Company_Settings, { foreignKey: 'company_settings_id' });
    }
  }
  EFM_Salesforce.init(
    {
      efm_salesforce_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      account_map: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      lead_map: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      contact_map: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      company_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'efm_salesforce',
      modelName: 'EFM_Salesforce',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return EFM_Salesforce;
};
