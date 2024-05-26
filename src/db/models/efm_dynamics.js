'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class EFM_Dynamics extends Model {
    static associate({ Company_Settings }) {
      this.belongsTo(Company_Settings, {
        foreignKey: 'company_settings_id',
      });
    }
  }
  EFM_Dynamics.init(
    {
      efm_dynamics_id: {
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
      tableName: 'efm_dynamics',
      modelName: 'EFM_Dynamics',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return EFM_Dynamics;
};
