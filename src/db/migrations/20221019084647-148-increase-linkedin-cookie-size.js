'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn(
      'user_token',
      'encrypted_linkedin_cookie',
      {
        type: Sequelize.STRING(3000),
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn(
      'user_token',
      'encrypted_linkedin_cookie',
      {
        type: Sequelize.STRING(500),
        allowNull: true,
      }
    );
  },
};
