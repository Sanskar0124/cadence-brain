'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('lead', 'stopped_cadence', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'avg_time_till_first_call',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('lead', 'stopped_cadence');
  },
};
