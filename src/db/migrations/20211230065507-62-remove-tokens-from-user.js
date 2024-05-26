'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user', 'ringover_api_key');
    await queryInterface.removeColumn('user', 'google_refresh_token');
    await queryInterface.removeColumn('user', 'google_calendar_sync_token');
    await queryInterface.removeColumn('user', 'google_mail_last_history_id');
    return await queryInterface.removeColumn(
      'user',
      'google_calendar_channel_id'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'ringover_api_key', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('user', 'google_refresh_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('user', 'google_calendar_sync_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('user', 'google_mail_last_history_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    return await queryInterface.addColumn(
      'user',
      'google_calendar_channel_id',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },
};
