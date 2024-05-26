'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lead', 'integration_status', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'account_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('lead', 'integration_status');
  },
};
