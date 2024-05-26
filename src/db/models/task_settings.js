'use strict';
// Utils
const { NODE_TYPES } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Task_Settings extends Model {
    static associate({ Company, User, Sub_Department }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
    }
  }
  Task_Settings.init(
    {
      task_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      calls_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 40,
      },
      mails_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      messages_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      linkedin_connections_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      linkedin_messages_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      linkedin_profiles_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      linkedin_interacts_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      data_checks_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      //reply_tos_per_day: {
      //// will be stored as percentage
      //type: Sequelize.INTEGER,
      //defaultValue: 10,
      //},
      cadence_customs_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      tasks_to_be_added_per_day: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      max_tasks: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      late_settings: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          [NODE_TYPES.CALL]: 1 * 24 * 60 * 60 * 1000,
          [NODE_TYPES.MESSAGE]: 1 * 24 * 60 * 60 * 1000,
          [NODE_TYPES.MAIL]: 1 * 24 * 60 * 60 * 1000,
          [NODE_TYPES.LINKEDIN_MESSAGE]: 1 * 24 * 60 * 60 * 1000,
          [NODE_TYPES.LINKEDIN_PROFILE]: 1 * 24 * 60 * 60 * 1000,
          [NODE_TYPES.LINKEDIN_INTERACT]: 1 * 24 * 60 * 60 * 1000,
          [NODE_TYPES.LINKEDIN_CONNECTION]: 1 * 24 * 60 * 60 * 1000,
          [NODE_TYPES.DATA_CHECK]: 1 * 24 * 60 * 60 * 1000,
          [NODE_TYPES.CADENCE_CUSTOM]: 1 * 24 * 60 * 60 * 1000,
          [NODE_TYPES.WHATSAPP]: 1 * 24 * 60 * 60 * 1000,
        }),
      },
      high_priority_split: {
        type: Sequelize.INTEGER,
        defaultValue: 80,
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
    },
    {
      sequelize,
      tableName: 'task_settings',
      modelName: 'Task_Settings',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Task_Settings;
};
