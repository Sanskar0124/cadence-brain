'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('automated_task_settings', {
      at_settings_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      level: {
        type: Sequelize.STRING,
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
        allowNull: true,
      },
      end_hour: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      max_emails_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      time_between_emails: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      delay_duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      created_at: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('automated_task_settings');
  },
};
