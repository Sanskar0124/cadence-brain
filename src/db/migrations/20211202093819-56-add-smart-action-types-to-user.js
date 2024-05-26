'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('user', 'smart_action_type', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'columns',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user', 'smart_action_type');
  },
};
