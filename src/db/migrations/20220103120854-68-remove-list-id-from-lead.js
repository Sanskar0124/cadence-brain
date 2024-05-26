'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('lead', 'list_id');
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('lead', 'list_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
