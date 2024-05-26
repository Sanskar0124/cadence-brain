'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('email', 'cadence_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('email', 'node_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('email', 'cadence_id');
    await queryInterface.removeColumn('email', 'node_id');
  },
};
