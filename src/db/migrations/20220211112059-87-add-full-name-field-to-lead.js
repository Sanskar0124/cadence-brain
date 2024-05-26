'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lead', 'full_name', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'last_name',
    });
    // await queryInterface.sequelize.query("");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('lead', 'full_name');
  },
};
