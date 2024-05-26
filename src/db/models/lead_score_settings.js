'use strict';

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Lead_Score_Settings extends Model {
    static associate({ Company, Sub_Department, User }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
      this.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  Lead_Score_Settings.init(
    {
      ls_settings_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      total_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      email_clicked: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 20,
      },
      email_opened: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      email_replied: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      incoming_call_received: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      sms_clicked: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 20,
      },
      demo_booked: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 40,
      },
      outgoing_call: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      outgoing_call_duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 120,
      },
      unsubscribe: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      bounced_mail: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status_update: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      score_threshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 35,
      },
      reset_period: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'lead_score_settings',
      modelName: 'Lead_Score_Settings',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Lead_Score_Settings;
};
