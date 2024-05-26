'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('task', [
      {
        task_id: 1,
        name: 'Send Mail',
        start_time: new Date().getTime(),
        urgent_time: new Date().getTime() + 2 * 60 * 60 * 1000,
        lead_id: 5,
        user_id: 3,
        node_id: 5,
        cadence_id: 1,
        completed: 0,
      },
      {
        task_id: 2,
        name: 'Send Message',
        start_time: new Date().getTime(),
        urgent_time: new Date().getTime() + 2 * 60 * 60 * 1000,
        lead_id: 5,
        user_id: 3,
        node_id: 6,
        cadence_id: 1,
        completed: 0,
      },
      {
        task_id: 3,
        name: 'Call',
        start_time: new Date().getTime(),
        urgent_time: new Date().getTime() + 2 * 60 * 60 * 1000,
        lead_id: 5,
        user_id: 3,
        node_id: 7,
        cadence_id: 1,
        completed: 0,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('task', null, {});
  },
};
