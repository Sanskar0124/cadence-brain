'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_token', 'google_token_expiration', {
      after: 'encrypted_google_refresh_token',
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_token', 'google_token_expiration');
  },
};
