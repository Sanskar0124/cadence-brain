'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Bullhorn_Field_Map extends Model {
    static associate({ Company_Settings }) {
      this.belongsTo(Company_Settings, { foreignKey: 'company_settings_id' });
    }
  }
  Bullhorn_Field_Map.init(
    {
      bfm_id: {
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
      candidate_map: {
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
      candidate_custom_object: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      company_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      default_integration_status: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'bullhorn_field_map',
      modelName: 'Bullhorn_Field_Map',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Bullhorn_Field_Map;
};
