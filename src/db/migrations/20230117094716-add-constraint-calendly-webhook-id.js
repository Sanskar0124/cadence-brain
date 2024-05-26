'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('user_token', {
      fields: ['encrypted_calendly_webhook_id'],
      type: 'unique',
      name: 'encrypted_calendly_webhook_id_constraint',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'user_token',
      'encrypted_calendly_webhook_id_constraint'
    );
  },
};
