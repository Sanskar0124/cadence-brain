'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('zoho_webhook', 'company_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('zoho_webhook', 'company_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
