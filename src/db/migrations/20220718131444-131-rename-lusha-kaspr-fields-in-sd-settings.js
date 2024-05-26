'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'sub_department_settings',
      'lusha_service_enabled',
      'enable_new_users_lusha'
    );
    await queryInterface.renameColumn(
      'sub_department_settings',
      'kaspr_service_enabled',
      'enable_new_users_kaspr'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'sub_department_settings',
      'enable_new_users_lusha',
      'lusha_service_enabled'
    );
    await queryInterface.renameColumn(
      'sub_department_settings',
      'enable_new_users_kaspr',
      'kaspr_service_enabled'
    );
  },
};
