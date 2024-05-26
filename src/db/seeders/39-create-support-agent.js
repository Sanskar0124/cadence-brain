'use strict';
// Utils
const { SALT_ROUNDS } = require('../../utils/config');

// Packages
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'support_agent',
      [
        {
          sa_id: 'e8cb3fca-e53e-4396-a13f-66a2b6663d93',
          first_name: 'Abhishek',
          last_name: 'Prasad',
          email: 'abhishek.prasad@bjtmail.com',
          created_at: '2022-11-02T13:30:23.000',
          updated_at: '2022-11-02T13:30:23.000',
        },
        {
          sa_id: '81e0be85-a467-4574-9da8-0f329f212a28',
          first_name: 'Tirtharaj',
          last_name: 'Sengupta',
          email: 'tirtharaj.sengupta@bjtmail.com',
          created_at: '2022-11-02T13:30:23.000',
          updated_at: '2022-11-02T13:30:23.000',
        },
      ],
      {}
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('support_agent', null, {});
  },
};
