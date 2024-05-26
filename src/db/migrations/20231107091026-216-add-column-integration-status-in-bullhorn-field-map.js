'use strict';

// * Utils
const { DEFAULT_BULLHORN_INTEGRATION_STATUS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'bullhorn_field_map',
      'default_integration_status',
      {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          lead: DEFAULT_BULLHORN_INTEGRATION_STATUS.LEAD,
          contact: DEFAULT_BULLHORN_INTEGRATION_STATUS.CONTACT,
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'bullhorn_field_map',
      'default_integration_status'
    );
  },
};
