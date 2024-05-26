'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'automated_task_settings',
      [
        {
          priority: 3,
          working_days: JSON.stringify([1, 1, 1, 1, 1, 0, 0]),
          start_hour: '09:00',
          end_hour: '17:00',
          is_wait_time_random: false,
          company_id: '4192bff0-e1e0-43ce-a4db-912808c32493',
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('automated_task_settings', null, {});
  },
};
