'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('enrichments', 'lusha_linkedin_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('enrichments', 'kaspr_linkedin_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn(
      'enrichments',
      'default_linkedin_export_type',
      {
        type: Sequelize.STRING,
        defaultValue: 'lead',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('enrichments', 'lusha_linkedin_enabled');
    await queryInterface.removeColumn('enrichments', 'kaspr_linkedin_enabled');
    await queryInterface.removeColumn(
      'enrichments',
      'default_linkedin_export_type'
    );
  },
};
