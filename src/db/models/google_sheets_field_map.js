'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Google_Sheets_Field_Map extends Model {
    static associate({ Company_Settings }) {
      this.belongsTo(Company_Settings, { foreignKey: 'company_settings_id' });
    }
  }
  Google_Sheets_Field_Map.init(
    {
      gsfm_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      lead_map: {
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
      tableName: 'google_sheets_field_map',
      modelName: 'Google_Sheets_Field_Map',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Google_Sheets_Field_Map;
};
