'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'link_store',
      [
        {
          url: 'https://www.google.com',
          message_id: '17ccbb222b2d28dc',
          redirect_url: 'https://www.facebook.com',
          link_text: 'hello',
          is_clicked: false,
          clicked_timestamp: null,
          clicked: 0,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('link_store', null, {});
  },
};
