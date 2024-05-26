'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn(
      'lead_to_cadence',
      'lead_cadence_order',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('lead_to_cadence', 'lead_cadence_order');
  },
};
