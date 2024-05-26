'use strict';
// Utils
const { LEAD_STATUS, LEAD_WARMTH } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Lead extends Model {
    static associate({
      User,
      Company,
      Note,
      Agenda,
      Account,
      Activity,
      Conversation,
      Status,
      Email,
      Lead_phone_number,
      Task,
      LeadToCadence,
      Lead_email,
      Demo,
      Lead_Score_Reasons,
    }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.hasMany(Note, { foreignKey: 'lead_id' });
      this.hasMany(Agenda, { foreignKey: 'lead_id' });
      this.belongsTo(Account, { foreignKey: 'account_id' });
      this.hasMany(Activity, { foreignKey: 'lead_id' });
      this.hasMany(Conversation, { foreignKey: 'lead_id' });
      this.hasMany(Status, { foreignKey: 'lead_id' });
      this.hasMany(Email, { foreignKey: 'lead_id' });
      this.hasMany(Lead_phone_number, { foreignKey: 'lead_id' });
      this.hasMany(Lead_email, { foreignKey: 'lead_id' });
      this.hasMany(Task, { foreignKey: 'lead_id' });
      this.hasMany(LeadToCadence, {
        foreignKey: 'lead_id',
        sourceKey: 'lead_id',
      });
      this.hasOne(Demo, { foreignKey: 'demo_id' });
      this.hasOne(Lead_Score_Reasons, { foreignKey: 'lead_id' });
    }
  }
  Lead.init(
    {
      lead_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM,
        values: Object.values(LEAD_STATUS),
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Lead must have a first name' },
          notEmpty: { msg: 'Lead first name must not be empty' },
        },
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      email_validity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      linkedin_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      job_position: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      source_site: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      duplicate: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      first_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesforce: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      first_contact_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      avg_time_till_first_call: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      stopped_cadence: {
        // * to determine if it is remove from cadence automatically(conditions applied)
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      assigned_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      salesforce_lead_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesforce_contact_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ringover_message_conv_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status_update_timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lead_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      lead_warmth: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: LEAD_WARMTH.COLD,
      },
      unix_reset_score: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: null,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'lead',
      modelName: 'Lead',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Lead;
};
