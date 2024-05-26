'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class EFM_Pipedrive extends Model {
    static associate({ Company_Settings }) {
      this.belongsTo(Company_Settings, { foreignKey: 'company_settings_id' });
    }
  }
  EFM_Pipedrive.init(
    {
      efm_pipedrive_id: {
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
      company_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'efm_pipedrive',
      modelName: 'EFM_Pipedrive',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return EFM_Pipedrive;
};
