'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.createTable('user_token', {
      user_token_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // * ringover keys/tokens
      encrypted_ringover_api_key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // * google keys/tokens
      encrypted_google_refresh_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      encrypted_google_mail_last_history_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      encrypted_google_calendar_sync_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      encrypted_google_calendar_channel_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      encrypted_outlook_access_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_id: {
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
    return await queryInterface.dropTable('user_token');
  },
};
