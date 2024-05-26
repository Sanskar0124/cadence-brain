'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('task', 'list_id');
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('task', 'list_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
};
