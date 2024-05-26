'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // * Add unsubscribe task settings - JSON
    await queryInterface.addColumn('lead_to_cadence', 'unsubscribed', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      after: 'cadence_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('lead_to_cadence', 'unsubscribed');
  },
};
