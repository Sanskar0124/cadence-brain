'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('linkedin_automated_task_settings', {
      automated_linkedin_connection_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      automated_linkedin_message_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      automated_linkedin_profile_per_day: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('linkedin_automated_task_settings');
  },
};
