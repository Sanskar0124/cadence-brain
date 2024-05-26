'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('account', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      after: 'salesforce_account_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('account', 'user_id');
  },
};
