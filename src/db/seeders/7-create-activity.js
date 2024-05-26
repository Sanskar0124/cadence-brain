'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Activity',
      [
        {
          activity_id: 1,
          name: 'activity 1',
          type: 'call',
          status: 'missed call',
          lead_id: 1,
          node_id: 1,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Activity', null, {});
  },
};
