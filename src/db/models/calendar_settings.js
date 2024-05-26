'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Calendar_Settings extends Model {
    static associate({ User, Company }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Company, { foreignKey: 'company_id' });
    }
  }
  Calendar_Settings.init(
    {
      cs_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      meeting_duration: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [15, 30, 45, 60],
      },
      meeting_buffer: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 30,
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
      working_start_hour: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '09:00',
      },
      working_end_hour: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '18:00',
      },
      break_start_time: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '13:00',
      },
      break_end_time: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '14:00',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        unique: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'calendar_settings',
      modelName: 'Calendar_Settings',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Calendar_Settings;
};
