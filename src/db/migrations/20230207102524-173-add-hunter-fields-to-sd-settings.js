'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'sub_department_settings',
      'enable_new_users_hunter',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'sub_department_settings',
      'enable_new_users_hunter'
    );
  },
};
