'use strict';

// * Utils
const { MAIL_SCOPE_LEVEL } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('webhook', 'integration_status', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('webhook', 'object_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('webhook', 'integration_status');
    await queryInterface.removeColumn('webhook', 'object_type');
  },
};
