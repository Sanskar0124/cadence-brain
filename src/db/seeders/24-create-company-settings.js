'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'company_settings',
      [
        {
          company_settings_id: 1,
          change_contact_owners_when_account_change: false,
          change_account_and_contact_when_contact_change: false,
          sf_activity_to_log: JSON.stringify({
            CALL: {
              enabled: false,
            },
            SMS: {
              enabled: false,
            },
            MAIL: {
              enabled: true,
            },
            CALENDAR: {
              enabled: true,
            },
            NOTE: {
              enabled: false,
            },
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
    await queryInterface.bulkDelete('company_settings', null, {});
  },
};
