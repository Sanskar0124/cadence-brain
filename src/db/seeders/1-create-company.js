'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'company',
      [
        {
          company_id: '4192bff0-e1e0-43ce-a4db-912808c32493',
          name: 'ringover',
          url: 'https://www.ringover.com',
          linkedin_url:
            'https://www.linkedin.com/company/ringover-france/mycompany/',
          location: 'France',
          is_subscription_active: 1,
          number_of_licences: 100,
          integration_type: 'salesforce',
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('company', null, {});
  },
};
