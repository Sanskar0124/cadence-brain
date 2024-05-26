'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('enrichments', 'snov_action', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('enrichments', 'is_snov_activated', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('enrichments', 'snov_linkedin_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('enrichments', 'snov_email', {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('enrichments', 'snov_action');
    await queryInterface.removeColumn('enrichments', 'is_snov_activated');
    await queryInterface.removeColumn('enrichments', 'snov_linkedin_enabled');
    await queryInterface.removeColumn('enrichments', 'snov_email');
  },
};
