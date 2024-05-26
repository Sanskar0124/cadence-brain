'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('cadence', 'inside_sales', {
      // * This is for the inbound list created for inbound leads
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('cadence', 'inside_sales');
  },
};
