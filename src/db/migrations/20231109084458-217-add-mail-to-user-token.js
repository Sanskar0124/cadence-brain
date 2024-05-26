'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_token', 'onboarding_mail_message_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('user_token', 'onboarding_mail_status', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'user_token',
      'onboarding_mail_message_id'
    );
    await queryInterface.removeColumn('user_token', 'onboarding_mail_status');
  },
};
