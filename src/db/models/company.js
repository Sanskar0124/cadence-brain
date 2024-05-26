'use strict';
// Packages
const { Model } = require('sequelize');
const zoho_webhook = require('./zoho_webhook');
const { COMPANY_STATUS } = require('../../utils/enums');

module.exports = (sequelize, Sequelize) => {
  class Company extends Model {
    static associate({
      User,
      Lead,
      Department,
      Email_Settings,
      Company_Settings,
      Company_History,
      Company_Tokens,
      Unsubscribe_Mail_Settings,
      Bounced_Mail_Settings,
      Custom_Domain,
      Enrichments,
      Email_Template,
      Video_Template,
      Hubspot_Imports,
      Automated_Workflow,
      Account,
      Zoho_Webhook,
      Lead_Score_Settings,
    }) {
      this.hasMany(User, { foreignKey: 'company_id' });
      this.hasMany(Lead, { foreignKey: 'company_id' });
      this.hasMany(Department, { foreignKey: 'company_id' });
      this.hasOne(Email_Settings, { foreignKey: 'company_id' });
      this.hasOne(Company_Settings, { foreignKey: 'company_id' });
      this.hasMany(Company_History, { foreignKey: 'company_id' });
      this.hasOne(Lead_Score_Settings, { foreignKey: 'company_id' });
      this.hasOne(Company_Tokens, { foreignKey: 'company_id' });
      this.hasOne(Custom_Domain, { foreignKey: 'company_id' });
      this.hasMany(Unsubscribe_Mail_Settings, { foreignKey: 'company_id' });
      this.hasMany(Bounced_Mail_Settings, { foreignKey: 'company_id' });
      this.hasOne(Enrichments, { foreignKey: 'company_id' });
      this.hasMany(Email_Template, { foreignKey: 'et_id' });
      this.hasMany(Video_Template, { foreignKey: 'vt_id' });
      this.hasMany(Hubspot_Imports, { foreignKey: 'company_id' });
      this.hasMany(Automated_Workflow, { foreignKey: 'company_id' });
      this.hasMany(Account, { foreignKey: 'company_id' });
      this.hasMany(Zoho_Webhook, { foreignKey: 'company_id' });
    }
  }
  Company.init(
    {
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      linkedin_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      number_of_licences: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_subscription_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_trial_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      integration: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      integration_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ringover_team_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      trial_valid_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      region: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'eu',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: COMPANY_STATUS.NOT_CONFIGURED,
      },
      plan_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      plan_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      license_activated_on: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'company',
      modelName: 'Company',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Company;
};
