'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    //await queryInterface.removeColumn('user', 'salesforce_owner_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'salesforce_owner_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
