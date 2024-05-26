'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.createTable('calendar_settings', {
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
        defaultValue: [1, 1, 1, 1, 1, 0, 0],
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
    return await queryInterface.dropTable('calendar_settings');
  },
};
