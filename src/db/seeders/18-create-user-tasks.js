'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('user_task', [
      {
        user_task_id: 1,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: 1,
      },
      {
        user_task_id: 2,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: 2,
      },
      {
        user_task_id: 3,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: 3,
      },
      {
        user_task_id: 4,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: 4,
      },
      {
        user_task_id: 5,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: 5,
      },
      {
        user_task_id: 6,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: 6,
      },
      {
        user_task_id: 7,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: 7,
      },
      {
        user_task_id: 8,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: 8,
      },
      {
        user_task_id: 9,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: 9,
      },
      {
        user_task_id: 10,
        calls_per_day: 25,
        mails_per_day: 25,
        messages_per_day: 25,
        linkedins_per_day: 25,
        user_id: '7f1ae71c-c48b-4722-9987-25217206d09b',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('user_task', null, {});
  },
};
