'use strict';

// Utils
const {
  USER_ROLE,
  SMART_ACTION_TYPE,
  SETTING_LEVELS,
  CALLBACK_DEVICES,
  PRODUCT_TOUR_STATUSES,
} = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class User extends Model {
    static associate({
      Company,
      Department,
      Sub_Department,
      Message_Template,
      Email_Template,
      Lead,
      Conversation,
      Signature,
      Calendar_Settings,
      Email,
      User_Task,
      Task,
      Cadence,
      User_Token,
      Account,
      Unsubscribe_Mail_Settings,
      Bounced_Mail_Settings,
      Settings,
      Salesforce_Tokens,
      Pipedrive_Tokens,
      Hubspot_Tokens,
      Zoho_Tokens,
      Sellsy_Tokens,
      Ringover_Tokens,
      Video,
      Bullhorn_Tokens,
      Activity,
      Dynamics_Tokens,
      Lead_Score_Settings,
      Recent_Action,
      Cadence_Template,
      Openai_Log,
      Tracking,
    }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.belongsTo(Department, { foreignKey: 'department_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
      this.hasMany(Message_Template, { foreignKey: 'user_id' });
      this.hasMany(Email_Template, { foreignKey: 'user_id' });
      this.hasMany(Lead, { foreignKey: 'user_id' });
      this.hasMany(Conversation, { foreignKey: 'user_id' });
      this.hasMany(Signature, { foreignKey: 'user_id' });
      this.hasMany(Email, { foreignKey: 'user_id' });
      this.hasOne(Calendar_Settings, { foreignKey: 'user_id' });
      this.hasOne(User_Task, { foreignKey: 'user_id' });
      this.hasOne(Cadence, { foreignKey: 'user_id', constraints: false });
      this.hasMany(Task, { foreignKey: 'user_id' });
      this.hasMany(Recent_Action, { foreignKey: 'user_id' });
      this.hasOne(User_Token, { foreignKey: 'user_id' });
      this.hasMany(Account, { foreignKey: 'user_id', sourceKey: 'user_id' });
      this.hasMany(Unsubscribe_Mail_Settings, { foreignKey: 'user_id' });
      this.hasMany(Bounced_Mail_Settings, { foreignKey: 'user_id' });
      this.hasMany(Openai_Log, { foreignKey: 'user_id' });
      this.hasOne(Lead_Score_Settings, { foreignKey: 'user_id' });
      this.hasOne(Settings, {
        sourceKey: 'settings_id',
        foreignKey: 'settings_id',
      });
      this.hasOne(Salesforce_Tokens, {
        sourceKey: 'user_id',
        foreignKey: 'user_id',
      });
      this.hasOne(Pipedrive_Tokens, {
        sourceKey: 'user_id',
        foreignKey: 'user_id',
      });
      this.hasOne(Hubspot_Tokens, {
        sourceKey: 'user_id',
        foreignKey: 'user_id',
      });
      this.hasOne(Zoho_Tokens, {
        sourceKey: 'user_id',
        foreignKey: 'user_id',
      });
      this.hasOne(Sellsy_Tokens, {
        sourceKey: 'user_id',
        foreignKey: 'user_id',
      });
      this.hasOne(Bullhorn_Tokens, {
        sourceKey: 'user_id',
        foreignKey: 'user_id',
      });
      this.hasMany(Ringover_Tokens, {
        sourceKey: 'user_id',
        foreignKey: 'user_id',
      });
      this.hasMany(Video, { foreignKey: 'user_id' });
      this.hasMany(Activity, { foreignKey: 'user_id' });
      this.hasOne(Dynamics_Tokens, {
        sourceKey: 'user_id',
        foreignKey: 'user_id',
      });
      this.hasMany(Cadence_Template, {
        sourceKey: 'user_id',
        foreignKey: 'user_id',
      });
      this.hasMany(Tracking, { foreignKey: 'user_id' });
    }
  }
  User.init(
    {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'User must have a first name' },
          notEmpty: { msg: 'User first name must not be empty' },
        },
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'User must have a last name' },
          notEmpty: { msg: 'User last name must not be empty' },
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: { msg: 'User must have an email address' },
          notEmpty: { msg: 'User email address must not be empty' },
          isEmail: { msg: 'Enter a valid email address.' },
        },
      },
      primary_email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      linkedin_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      primary_phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'english',
      },
      columns: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      smart_action_type: {
        type: Sequelize.JSON,
        allowNull: true,
        validate: {
          isLength2(value) {
            if (value && value.length > 2) {
              throw new Error('Maximum 2 smart actions allowed.');
            }
          },
          isValid(value) {
            if (value) {
              value.map((v) => {
                if (!Object.values(SMART_ACTION_TYPE).includes(v)) {
                  throw new Error('Not a valid smart action type.');
                }
              });
            }
          },
        },
      },
      smart_action: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      profile_picture: {
        type: Sequelize.VIRTUAL,
        get() {
          return `https://storage.googleapis.com/apt-cubist-307713.appspot.com/crm/profile-images/${this.user_id}`;
        },
        set(value) {
          throw new Error('Do not try to set the `profile_picture` value!');
        },
      },
      is_profile_picture_present: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ringover_user_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        unique: true,
      },
      salesforce_owner_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      create_agendas_from_custom_task: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      calendly_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_call_iframe_fixed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_onboarding_complete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      callback_device: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: CALLBACK_DEVICES.WEB,
        set(value) {
          if (Object.values(CALLBACK_DEVICES).includes(value)) {
            this.setDataValue('callback_device', value);
          } else {
            this.setDataValue('callback_device', null);
          }
        },
      },
      // datetime value for user's last login
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      product_tour_status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: PRODUCT_TOUR_STATUSES.AFTER_ONBOARDING_PENDING,
      },
      product_tour_step: {
        type: Sequelize.JSON,
        defaultValue: {},
        allowNull: true,
      },
      support_role: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // stored in seconds
      focus_delay: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      // ringover_api_key: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      // },
      // google_refresh_token: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      // },
      // google_calendar_sync_token: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      // },
      // google_mail_last_history_id: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      // },
      // google_calendar_channel_id: {
      //   allowNull: true,
      //   type: Sequelize.STRING,
      // },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'user',
      modelName: 'User',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return User;
};
