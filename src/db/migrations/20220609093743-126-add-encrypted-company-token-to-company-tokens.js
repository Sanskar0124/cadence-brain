'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('company_tokens', 'encrypted_api_token', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'encrypted_kaspr_api_key',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('company_tokens', 'encrypted_api_token');
  },
};
