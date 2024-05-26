'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.createTable('email_settings', {
      email_settings_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
        defaultValue: '09:00',
      },
      end_hour: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '18:00',
      },
      max_emails_per_day: {
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
        // * will be stored as minutes
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 5,
      },
      wait_time_lower_limit: {
        // * will be stored as minutes
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      delay: {
        // * will be stored as minutes
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.dropTable('email_settings');
  },
};
