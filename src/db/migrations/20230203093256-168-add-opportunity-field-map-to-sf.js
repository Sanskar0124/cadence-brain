'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('salesforce_field_map', 'opportunity_map', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn(
      'salesforce_field_map',
      'opportunity_custom_object',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('account', 'opportunity_map');
    await queryInterface.removeColumn('account', 'opportunity_custom_object');
  },
};
