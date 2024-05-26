'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Pipedrive_Field_Map extends Model {
    static associate({ Company_Settings }) {
      this.belongsTo(Company_Settings, { foreignKey: 'company_settings_id' });
    }
  }
  Pipedrive_Field_Map.init(
    {
      pfm_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      person_map: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      organization_map: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      deal_map: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      deal_custom_object: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      person_custom_object: {
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
      tableName: 'pipedrive_field_map',
      modelName: 'Pipedrive_Field_Map',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Pipedrive_Field_Map;
};
