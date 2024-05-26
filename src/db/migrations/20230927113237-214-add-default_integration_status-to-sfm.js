'use strict';

// * Utils
const { DEFAULT_INTEGRATION_STATUS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'salesforce_field_map',
      'default_integration_status',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: DEFAULT_INTEGRATION_STATUS.CONTACT,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'salesforce_field_map',
      'default_integration_status'
    );
  },
};
