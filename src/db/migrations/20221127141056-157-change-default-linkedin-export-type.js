'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'enrichments',
      'default_linkedin_export_type',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'enrichments',
      'default_linkedin_export_type',
      {
        type: Sequelize.STRING,
        defaultValue: 'lead',
      }
    );
  },
};
