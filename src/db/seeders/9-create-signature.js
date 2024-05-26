'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'signature',
      [
        {
          signature_id: 1,
          name: 'Signature 1',
          signature: 'signature',
          user_id: 2,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('signature', null, {});
  },
};
