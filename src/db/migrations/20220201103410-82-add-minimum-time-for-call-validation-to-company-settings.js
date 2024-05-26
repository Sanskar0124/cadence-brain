'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'company_settings',
      'minimum_time_for_call_validation',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn(
      'company_settings',
      'minimum_time_for_call_validation'
    );
  },
};
