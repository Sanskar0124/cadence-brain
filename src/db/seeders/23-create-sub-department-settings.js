'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('sub_department_settings', [
      {
        sd_id: '4192bff0-e1e0-43ce-a4db-912808c32499',
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        sd_id: '4192bff0-e1e0-43ce-a4db-912808c32495',
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        sd_id: '4192bff0-e1e0-43ce-a4db-912808c32496',
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        sd_id: '4192bff0-e1e0-43ce-a4db-912808c32497',
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        sd_id: '4192bff0-e1e0-43ce-a4db-912808c32498',
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('sub_department_settings', null, {});
  },
};
