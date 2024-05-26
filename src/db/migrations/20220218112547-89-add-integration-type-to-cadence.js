'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('cadence', 'integration_type', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'priority',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('cadence', 'integration_type');
  },
};
