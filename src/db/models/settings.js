'use strict';
// Utils
const { SETTING_LEVELS } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Settings extends Model {
    static associate({
      User,
      Unsubscribe_Mail_Settings,
      Automated_Task_Settings,
      Bounced_Mail_Settings,
      Task_Settings,
      Skip_Settings,
      Lead_Score_Settings,
    }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.hasOne(Unsubscribe_Mail_Settings, {
        foreignKey: 'unsubscribe_settings_id',
        sourceKey: 'unsubscribe_settings_id',
      });
      this.hasOne(Automated_Task_Settings, {
        foreignKey: 'at_settings_id',
        sourceKey: 'at_settings_id',
      });
      this.hasOne(Bounced_Mail_Settings, {
        foreignKey: 'bounced_settings_id',
        sourceKey: 'bounced_settings_id',
      });
      this.hasOne(Task_Settings, {
        foreignKey: 'task_settings_id',
        sourceKey: 'task_settings_id',
      });
      this.hasOne(Skip_Settings, {
        foreignKey: 'skip_settings_id',
        sourceKey: 'skip_settings_id',
      });
      this.hasOne(Lead_Score_Settings, {
        foreignKey: 'ls_settings_id',
        sourceKey: 'ls_settings_id',
      });
    }
  }
  Settings.init(
    {
      settings_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      automated_task_setting_priority: {
        type: Sequelize.INTEGER,
        defaultValue: SETTING_LEVELS.ADMIN,
      },
      unsubscribe_setting_priority: {
        type: Sequelize.INTEGER,
        defaultValue: SETTING_LEVELS.ADMIN,
      },
      bounced_setting_priority: {
        type: Sequelize.INTEGER,
        defaultValue: SETTING_LEVELS.ADMIN,
      },
      skip_setting_priority: {
        type: Sequelize.INTEGER,
        defaultValue: SETTING_LEVELS.ADMIN,
      },
      ls_setting_priority: {
        type: Sequelize.INTEGER,
        defaultValue: SETTING_LEVELS.ADMIN,
      },
      task_setting_priority: {
        type: Sequelize.INTEGER,
        defaultValue: SETTING_LEVELS.ADMIN,
      },
      at_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      unsubscribe_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bounced_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      task_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      skip_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ls_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      stats_columns: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Settings',
      tableName: 'settings',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Settings;
};
