'use strict';

const { CADENCE_PRIORITY } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('cadence', 'priority', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: CADENCE_PRIORITY.STANDARD,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('cadence', 'priority');
  },
};
