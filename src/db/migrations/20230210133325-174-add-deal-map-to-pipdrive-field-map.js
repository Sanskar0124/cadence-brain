'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pipedrive_field_map', 'deal_map', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn(
      'pipedrive_field_map',
      'deal_custom_object',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('pipedrive_field_map', 'deal_map');
    await queryInterface.removeColumn(
      'pipedrive_field_map',
      'deal_custom_object'
    );
  },
};
