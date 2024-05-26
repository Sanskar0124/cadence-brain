'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'sub_department',
      [
        {
          sd_id: '4192bff0-e1e0-43ce-a4db-912808c32499',
          name: 'Admin',
          department_id: '4192bff0-e1e0-43ce-a4db-912808c32494',
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
        {
          sd_id: '4192bff0-e1e0-43ce-a4db-912808c32495',
          name: 'Test',
          department_id: '4192bff0-e1e0-43ce-a4db-912808c32494',
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
        {
          sd_id: '4192bff0-e1e0-43ce-a4db-912808c32496',
          name: 'Team_UK',
          department_id: '4192bff0-e1e0-43ce-a4db-912808c32494',
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
        {
          sd_id: '4192bff0-e1e0-43ce-a4db-912808c32497',
          name: 'Team_FR',
          department_id: '4192bff0-e1e0-43ce-a4db-912808c32494',
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
        {
          sd_id: '4192bff0-e1e0-43ce-a4db-912808c32498',
          name: 'Team_IND',
          department_id: '4192bff0-e1e0-43ce-a4db-912808c32494',
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('sub_department', null, {});
  },
};
