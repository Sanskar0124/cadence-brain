'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'salesforce_field_map',
      'lead_custom_object',
      {
        type: Sequelize.JSON,
        after: 'contact_map',
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'salesforce_field_map',
      'contact_custom_object',
      {
        type: Sequelize.JSON,
        after: 'lead_custom_object',
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'salesforce_field_map',
      'lead_custom_object'
    );
    await queryInterface.removeColumn(
      'salesforce_field_map',
      'contact_custom_object'
    );
  },
};
