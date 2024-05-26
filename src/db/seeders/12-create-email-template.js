'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('email_template', [
      {
        et_id: 2,
        name: 'Email template 2',
        subject: 'Subject for et2',
        body: 'body for et2',
        level: 'personal',
        user_id: 2,

        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        et_id: 3,
        name: 'Email template 3',
        subject: 'Subject for et3',
        body: 'body for et3',
        level: 'personal',
        user_id: 3,

        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        et_id: 4,
        name: 'Email template 4',
        subject: 'Subject for et4',
        body: 'body for et4',
        level: 'personal',
        user_id: 4,

        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('email_template', null, {});
  },
};
