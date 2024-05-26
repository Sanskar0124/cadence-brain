'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'company_tokens',
      'encrypted_hunter_api_key',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'company_tokens',
      'encrypted_hunter_api_key'
    );
  },
};
