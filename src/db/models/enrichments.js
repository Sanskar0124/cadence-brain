'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Enrichments extends Model {
    static associate({ Company }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
    }
  }
  Enrichments.init(
    {
      enr_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // * All api limits are 'daily' limits
      // * All 'api_calls' fields are reset everyday

      // lusha
      lusha_api_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      lusha_api_calls: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lusha_action: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_lusha_activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lusha_linkedin_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lusha_phone: {
        type: Sequelize.JSON,
        defaultValue: JSON.stringify({}),
      },
      lusha_email: {
        type: Sequelize.JSON,
        defaultValue: JSON.stringify({}),
      },

      // kaspr
      kaspr_api_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      kaspr_api_calls: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      kaspr_action: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_kaspr_activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      kaspr_linkedin_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      kaspr_phone: {
        type: Sequelize.JSON,
        defaultValue: JSON.stringify({}),
      },
      kaspr_email: {
        type: Sequelize.JSON,
        defaultValue: JSON.stringify({}),
      },

      // hunter
      hunter_api_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      hunter_api_calls: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_hunter_activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hunter_linkedin_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hunter_email: {
        type: Sequelize.JSON,
        defaultValue: JSON.stringify({}),
      },

      // dropcontact
      dropcontact_api_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      dropcontact_api_calls: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_dropcontact_activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      dropcontact_action: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dropcontact_linkedin_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      dropcontact_email: {
        type: Sequelize.JSON,
        defaultValue: JSON.stringify({}),
      },

      // snov
      snov_api_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      snov_api_calls: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_snov_activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      snov_action: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      snov_linkedin_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      snov_email: {
        type: Sequelize.JSON,
        defaultValue: JSON.stringify({}),
      },

      // linkedin extension
      is_linkedin_activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      default_linkedin_export_type: {
        type: Sequelize.STRING,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'enrichments',
      modelName: 'Enrichments',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Enrichments;
};
