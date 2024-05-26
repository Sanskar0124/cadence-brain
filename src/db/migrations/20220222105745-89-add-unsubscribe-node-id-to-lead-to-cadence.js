'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn(
      'lead_to_cadence',
      'unsubscribe_node_id',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'lead_to_cadence',
      'unsubscribe_node_id'
    );
  },
};
