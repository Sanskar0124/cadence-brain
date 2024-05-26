'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('account', 'integration_status', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'salesforce_owner_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('account', 'integration_status');
  },
};
