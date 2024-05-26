'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'pipedrive_field_map',
      'person_custom_object',
      {
        type: Sequelize.JSON,
        after: 'organization_map',
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'pipedrive_field_map',
      'person_custom_object'
    );
  },
};
