'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'dynamics_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'dynamics_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'dynamics_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'dynamics_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );
  },
};
