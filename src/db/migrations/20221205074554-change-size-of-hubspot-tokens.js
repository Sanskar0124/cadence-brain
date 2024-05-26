'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn(
      'hubspot_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING(3000),
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn(
      'hubspot_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING(1000),
        allowNull: true,
      }
    );
  },
};
