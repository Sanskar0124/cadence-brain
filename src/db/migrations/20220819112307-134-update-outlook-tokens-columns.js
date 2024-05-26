'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'user_token',
      'encrypted_outlook_refresh_token',
      {
        type: Sequelize.STRING(2000),
        defaultValue: null,
      }
    );
    await queryInterface.addColumn('user_token', 'is_outlook_token_expired', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn(
      'user_token',
      'outlook_mail_inbox_subscription_id',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'user_token',
      'outlook_mail_outbox_subscription_id',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'user_token',
      'outlook_calendar_subscription_id',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.removeColumn(
      'user_token',
      'encrypted_outlook_access_token'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'user_token',
      'encrypted_outlook_refresh_token'
    );
    await queryInterface.removeColumn(
      'user_token',
      'outlook_mail_inbox_subscription_id'
    );
    await queryInterface.removeColumn(
      'user_token',
      'outlook_mail_outbox_subscription_id'
    );
    await queryInterface.removeColumn(
      'user_token',
      'outlook_calendar_subscription_id'
    );
    await queryInterface.removeColumn('user_token', 'is_outlook_token_expired');
    await queryInterface.addColumn(
      'user_token',
      'encrypted_outlook_access_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },
};
