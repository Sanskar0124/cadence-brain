'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('activity', 'to_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('activity', 'from_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('activity', 'to_number');
    await queryInterface.removeColumn('activity', 'from_number');
  },
};
