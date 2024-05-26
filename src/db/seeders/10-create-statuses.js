'use strict';

const { LEAD_STATUS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      below attributes are not added yet in dummy rows:-
      salesforce,score,first_contact_time
    */
    /*
      first 4 leads belongs to user2
      last 4 leads belongs to user8
    */
    await queryInterface.bulkInsert(
      'status',
      [
        {
          status_id: 1,
          status: LEAD_STATUS.NEW_LEAD,
          message: 'xyz.',
          lead_id: 1,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
        {
          status_id: 2,
          status: LEAD_STATUS.ONGOING,
          message: 'xyz.',
          lead_id: 2,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
        {
          status_id: 3,
          status: LEAD_STATUS.ONGOING,
          message: 'xyz.',
          lead_id: 3,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
        {
          status_id: 4,
          status: LEAD_STATUS.ONGOING,
          message: 'xyz.',
          lead_id: 4,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
        {
          status_id: 5,
          status: LEAD_STATUS.NEW_LEAD,
          message: 'xyz.',
          lead_id: 5,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('status', null, {});
  },
};
