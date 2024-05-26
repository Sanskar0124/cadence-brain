'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Automated_Task_Settings extends Model {
    static associate({ Company, Sub_Department, User }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
      this.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  Automated_Task_Settings.init(
    {
      at_settings_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      working_days: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [1, 1, 1, 1, 1, 0, 0], // Mon,Tue,Wed,Thur,Fri,Sat,Sun
        validate: {
          isLength7(value) {
            if (value && value.length !== 7) {
              throw new Error('length of working_days should be 7.');
            }
          },
          isBool(value) {
            if (value) {
              value.map((v) => {
                if (v !== 1 && v !== 0) {
                  throw new Error('Only 0 and 1 allowed in working_days.');
                }
              });
            }
          },
        },
      },
      start_hour: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '09:00',
      },
      end_hour: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '18:00',
      },
      max_emails_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 100,
      },
      max_sms_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 100,
      },
      is_wait_time_random: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      wait_time_upper_limit: {
        // * will be stored as seconds
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 60,
      },
      wait_time_lower_limit: {
        // * will be stored as seconds
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 30,
      },
      delay: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 60,
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
      modelName: 'Automated_Task_Settings',
      tableName: 'automated_task_settings',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Automated_Task_Settings;
};
