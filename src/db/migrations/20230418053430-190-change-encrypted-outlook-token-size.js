'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn(
      'user_token',
      'encrypted_outlook_refresh_token',
      {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn(
      'user_token',
      'encrypted_outlook_refresh_token',
      {
        type: Sequelize.STRING(2000),
        allowNull: true,
      }
    );
  },
};
