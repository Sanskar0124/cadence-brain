'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('enrichments', 'is_hunter_activated', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('enrichments', 'hunter_linkedin_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('enrichments', 'hunter_email', {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('enrichments', 'is_hunter_activated');
    await queryInterface.removeColumn('enrichments', 'hunter_linkedin_enabled');
    await queryInterface.removeColumn('enrichments', 'hunter_email');
  },
};
