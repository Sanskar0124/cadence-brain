'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Salesforce_Field_Map extends Model {
    static associate({ Company_Settings }) {
      this.belongsTo(Company_Settings, { foreignKey: 'company_settings_id' });
    }
  }
  Salesforce_Field_Map.init(
    {
      sfm_id: {
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
      opportunity_map: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      lead_custom_object: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      contact_custom_object: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      opportunity_custom_object: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      default_integration_status: {
        type: Sequelize.STRING,
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
      tableName: 'salesforce_field_map',
      modelName: 'Salesforce_Field_Map',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Salesforce_Field_Map;
};
