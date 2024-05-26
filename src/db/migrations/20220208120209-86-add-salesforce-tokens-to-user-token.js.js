'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'user_token',
      'encrypted_salesforce_access_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      'user_token',
      'encrypted_salesforce_refresh_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      'user_token',
      'encrypted_salesforce_instance_url',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn('user_token', 'is_salesforce_logged_out', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'user_token',
      'encrypted_salesforce_access_token'
    );
    await queryInterface.removeColumn(
      'user_token',
      'encrypted_salesforce_refresh_token'
    );
    await queryInterface.removeColumn(
      'user_token',
      'encrypted_salesforce_instance_url'
    );
    await queryInterface.removeColumn('user_token', 'is_salesforce_logged_out');
  },
};
