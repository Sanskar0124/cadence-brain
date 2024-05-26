'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'skip_settings',
      [
        {
          priority: 3,
          skip_allowed_tasks: JSON.stringify({
            mail: true,
          }),
          skip_reasons: JSON.stringify(['Unreachable', 'Wrong lead info.']),
          company_id: '4192bff0-e1e0-43ce-a4db-912808c32493',
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('skip_settings', null, {});
  },
};
