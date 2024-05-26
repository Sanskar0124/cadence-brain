'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addColumn('email_settings', 'max_sms_per_day', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 100,
      after: 'max_emails_per_day',
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn(
      'email_settings',
      'max_sms_per_day'
    );
  },
};
