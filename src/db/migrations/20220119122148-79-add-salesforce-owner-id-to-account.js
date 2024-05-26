'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('account', 'salesforce_owner_id', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'salesforce_account_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('account', 'salesforce_owner_id');
  },
};
