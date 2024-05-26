'use strict';

// Utils
const { PHONE_SYSTEM_TYPE, MAIL_SCOPE_LEVEL } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');
const { MAIL_INTEGRATION_TYPES } = require('../../utils/enums');

module.exports = (sequelize, Sequelize) => {
  class Company_Settings extends Model {
    static associate({
      Company,
      Salesforce_Field_Map,
      User,
      Pipedrive_Field_Map,
      EFM_Salesforce,
      EFM_Pipedrive,
      EFM_Excel,
      Google_Sheets_Field_Map,
      Excel_Field_Map,
      Webhook,
      Hubspot_Field_Map,
      EFM_Hubspot,
      EFM_GoogleSheets,
      EFM_Zoho,
      Zoho_Field_Map,
      Sellsy_Field_Map,
      EFM_Sellsy,
      EFM_Bullhorn,
      Bullhorn_Field_Map,
      Dynamics_Field_Map,
      EFM_Dynamics,
    }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.hasOne(Salesforce_Field_Map, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(Pipedrive_Field_Map, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(EFM_Salesforce, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(EFM_Pipedrive, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(EFM_Hubspot, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(EFM_GoogleSheets, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(EFM_Excel, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(Google_Sheets_Field_Map, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(Excel_Field_Map, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(Hubspot_Field_Map, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(User, {
        foreignKey: 'user_id',
        sourceKey: 'user_id',
      });
      this.hasOne(EFM_Zoho, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(Zoho_Field_Map, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasMany(Webhook, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(Sellsy_Field_Map, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(EFM_Sellsy, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(EFM_Bullhorn, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(Bullhorn_Field_Map, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(EFM_Dynamics, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
      this.hasOne(Dynamics_Field_Map, {
        foreignKey: 'company_settings_id',
        sourceKey: 'company_settings_id',
      });
    }
  }
  Company_Settings.init(
    {
      company_settings_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      change_contact_owners_when_account_change: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      change_account_and_contact_when_contact_change: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      minimum_time_for_call_validation: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      unsubscribed_task_settings: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      unsubscribe_link_madatory_for_semi_automated_mails: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      unsubscribe_link_madatory_for_automated_mails: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      default_unsubscribe_link_text: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Unsubscribe',
      },
      unsubscribe_from_all_cadences: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      contact_reassignment_rule: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'change_contact_and_account_owner',
      },
      account_reassignment_rule: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'change_only_account_owner',
      },
      salesforce_pn_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bounced_email_setting: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      custom_domain: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sf_activity_to_log: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          CALL: {
            enabled: false,
          },
          SMS: {
            enabled: false,
          },
          MAIL: {
            enabled: true,
          },
          CALENDAR: {
            enabled: true,
          },
          NOTE: {
            enabled: false,
          },
        }),
      },
      activity_to_log: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          CALL: {
            enabled: false,
          },
          SMS: {
            enabled: false,
          },
          MAIL: {
            enabled: true,
          },
          CALENDAR: {
            enabled: true,
          },
          NOTE: {
            enabled: false,
          },
        }),
      },
      mail_integration_type: {
        type: Sequelize.STRING(100),
        values: Object.values(MAIL_INTEGRATION_TYPES),
        allowNull: true,
        defaultValue: MAIL_INTEGRATION_TYPES.GOOGLE,
      },
      email_scope_level: {
        type: Sequelize.STRING,
        defaultValue: MAIL_SCOPE_LEVEL.STANDARD,
        allowNull: false,
      },
      phone_system: {
        type: Sequelize.STRING,
        defaultValue: PHONE_SYSTEM_TYPE.DEFAULT,
        allowNull: false,
      },
      custom_activity_type: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'company_settings',
      modelName: 'Company_Settings',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Company_Settings;
};
