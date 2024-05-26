'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('enrichments', 'lusha_phone', {
      type: Sequelize.JSON,
      default: JSON.stringify({}),
    });
    await queryInterface.addColumn('enrichments', 'lusha_email', {
      type: Sequelize.JSON,
      default: JSON.stringify({}),
    });
    await queryInterface.addColumn('enrichments', 'kaspr_phone', {
      type: Sequelize.JSON,
      default: JSON.stringify({}),
    });
    await queryInterface.addColumn('enrichments', 'kaspr_email', {
      type: Sequelize.JSON,
      default: JSON.stringify({}),
    });
    await queryInterface.addColumn('enrichments', 'is_linkedin_activated', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('enrichments', 'lusha_phone');
    await queryInterface.removeColumn('enrichments', 'lusha_email');
    await queryInterface.removeColumn('enrichments', 'kaspr_phone');
    await queryInterface.removeColumn('enrichments', 'kaspr_email');
    await queryInterface.removeColumn('enrichments', 'is_linkedin_activated');
  },
};
