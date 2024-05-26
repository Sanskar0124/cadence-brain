'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('node', 'step_number', {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: 'is_first',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('node', 'step_number');
  },
};
