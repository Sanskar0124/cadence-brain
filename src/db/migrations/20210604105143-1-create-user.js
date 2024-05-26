'use strict';

const { USER_ROLE } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM,
        values: Object.values(USER_ROLE),
        allowNull: true,
      },
      linkedin_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      primary_phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      google_refresh_token: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      columns: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      smart_action: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ringover_user_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      ringover_api_key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      google_refresh_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      google_calendar_sync_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      google_mail_last_history_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesforce_owner_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      google_calendar_channel_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      department_id: {
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
    await queryInterface.dropTable('user');
  },
};
