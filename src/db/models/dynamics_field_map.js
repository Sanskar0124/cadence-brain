'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Dynamics_Field_Map extends Model {
    static associate({ Company_Settings }) {
      this.belongsTo(Company_Settings, { foreignKey: 'company_settings_id' });
    }
  }
  Dynamics_Field_Map.init(
    {
      dfm_id: {
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
      company_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'dynamics_field_map',
      modelName: 'Dynamics_Field_Map',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Dynamics_Field_Map;
};
