'use strict';

const { ACTIVITY_TYPE } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activity', {
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM,
        values: Object.values(ACTIVITY_TYPE),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      recording: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      voicemail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ringover_call_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      salesforce_task_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gmail_message_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      note_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity');
  },
};
