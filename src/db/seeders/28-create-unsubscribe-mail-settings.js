'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'unsubscribe_mail_settings',
      [
        {
          priority: 3,
          semi_automatic_unsubscribed_data: JSON.stringify({
            mail: true,
            call: false,
          }),
          automatic_unsubscribed_data: JSON.stringify({
            mail: true,
          }),
          company_id: '4192bff0-e1e0-43ce-a4db-912808c32493',
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('unsubscribe_mail_settings', null, {});
  },
};
