'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'user_token',
      'encrypted_calendly_access_token',
      {
        type: Sequelize.STRING(3000),
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'user_token',
      'encrypted_calendly_refresh_token',
      {
        type: Sequelize.STRING(3000),
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'user_token',
      'encrypted_calendly_access_token'
    );
    await queryInterface.removeColumn(
      'user_token',
      'encrypted_calendly_refresh_token'
    );
  },
};
