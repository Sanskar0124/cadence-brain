'use strict';

const {
  ACCOUNT_SIZE,
  ACCOUNT_INTEGRATION_TYPES,
} = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'account',
      [
        {
          account_id: 1,
          name: 'Account 1',
          url: 'http://www.account1.com',
          linkedin_url: 'www.linkedinurl.com',
          phone_number: '123456789',
          size: ACCOUNT_SIZE[11_50],
          country: 'France',
          zipcode: 400123,
          integration_id: '123',
          integration_type: ACCOUNT_INTEGRATION_TYPES.SALESFORCE_ACCOUNT,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
        {
          account_id: 2,
          name: 'Zerodha',
          url: 'http://www.zerodha.com',
          linkedin_url: 'www.linkedinurl.com',
          phone_number: '123456789',
          size: ACCOUNT_SIZE[11_50],
          country: 'France',
          zipcode: 400123,
          integration_id: '123',
          integration_type: ACCOUNT_INTEGRATION_TYPES.SALESFORCE_ACCOUNT,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('account', null, {});
  },
};
