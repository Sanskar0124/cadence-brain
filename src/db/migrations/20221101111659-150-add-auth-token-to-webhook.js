'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('webhook', 'auth_token', {
      type: Sequelize.STRING,
      after: 'company_settings_id',
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('webhook', 'auth_token');
  },
};
