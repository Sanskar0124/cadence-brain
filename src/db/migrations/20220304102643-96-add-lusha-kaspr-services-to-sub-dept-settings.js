'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'sub_department_settings',
      'lusha_service_enabled',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      }
    );
    await queryInterface.addColumn(
      'sub_department_settings',
      'kaspr_service_enabled',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'sub_department_settings',
      'lusha_service_enabled'
    );
    await queryInterface.removeColumn(
      'sub_department_settings',
      'kaspr_service_enabled'
    );
  },
};
