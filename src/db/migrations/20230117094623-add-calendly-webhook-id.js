'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'user_token',
      'encrypted_calendly_webhook_id',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'user_token',
      'encrypted_calendly_webhook_id'
    );
  },
};
