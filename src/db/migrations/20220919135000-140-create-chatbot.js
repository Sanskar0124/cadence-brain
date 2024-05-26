'use strict';

const { CHATBOT_THREAD_STATUS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chatbot', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      slack_thread_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      issue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      assigned_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: CHATBOT_THREAD_STATUS.PENDING,
      },
      resolution_time: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      support_agent_access_start_time: {
        type: Sequelize.BIGINT,
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
    await queryInterface.dropTable('chatbot');
  },
};
