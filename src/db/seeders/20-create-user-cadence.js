'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('user_cadence', [
      {
        list_id: 1,
        user_id: 1,
        cadence_id: 2,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user_cadence', null, {});
  },
};
