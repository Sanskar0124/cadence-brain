'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('enrichments', 'dropcontact_action', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('enrichments', 'is_dropcontact_activated', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn(
      'enrichments',
      'dropcontact_linkedin_enabled',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    );
    await queryInterface.addColumn('enrichments', 'dropcontact_email', {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('enrichments', 'dropcontact_action');
    await queryInterface.removeColumn(
      'enrichments',
      'is_dropcontact_activated'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'dropcontact_linkedin_enabled'
    );
    await queryInterface.removeColumn('enrichments', 'dropcontact_email');
  },
};
