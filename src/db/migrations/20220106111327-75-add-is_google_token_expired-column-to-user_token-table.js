'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // add new column is_google_token_expired to user_token table
    return await queryInterface.addColumn(
      'user_token',
      'is_google_token_expired',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // drop column is_google_token_expired from user_token table
    return await queryInterface.removeColumn(
      'user_token',
      'is_google_token_expired'
    );
  },
};
