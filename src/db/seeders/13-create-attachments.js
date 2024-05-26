'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('attachment', [
      {
        attachment_id: 1,
        original_name: 'attachment.png',
        // content:
        //   '<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 02 00 00 01 00 01 00 00 ff db 00 43 00 08 06 06 07>',
        // content_type: 'img/png',
        et_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        attachment_id: 2,
        original_name: 'attachment.png',
        // content:
        //   '<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 02 00 00 01 00 01 00 00 ff db 00 43 00 08 06 06 07>',
        // content_type: 'img/png',
        et_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('attachment', null, {});
  },
};
