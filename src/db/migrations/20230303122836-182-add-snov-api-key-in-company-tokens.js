'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'company_tokens',
      'encrypted_snov_client_id',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'company_tokens',
      'encrypted_snov_client_secret',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'company_tokens',
      'encrypted_snov_client_id'
    );
    await queryInterface.removeColumn(
      'company_tokens',
      'encrypted_snov_client_secret'
    );
  },
};
