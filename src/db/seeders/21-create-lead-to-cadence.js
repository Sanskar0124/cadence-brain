'use strict';

const { CADENCE_LEAD_STATUS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('lead_to_cadence', [
      {
        lead_cadence_id: 1,
        lead_id: '3',
        cadence_id: '1',
        lead_cadence_order: 1,
        status: CADENCE_LEAD_STATUS.NOT_STARTED,
        created_at: '2021-06-08T20:01:000',
        updated_at: '2021-06-08T20:01:000',
      },
      {
        lead_cadence_id: 2,
        lead_id: '5',
        cadence_id: '1',
        status: CADENCE_LEAD_STATUS.NOT_STARTED,
        lead_cadence_order: 2,
        created_at: '2021-06-08T20:02:000',
        updated_at: '2021-06-08T20:02:000',
      },
      {
        lead_cadence_id: 3,
        lead_id: '2',
        cadence_id: '1',
        status: CADENCE_LEAD_STATUS.NOT_STARTED,
        lead_cadence_order: 3,
        created_at: '2021-06-08T20:03:000',
        updated_at: '2021-06-08T20:03:000',
      },
      {
        lead_cadence_id: 4,
        lead_id: '1',
        cadence_id: '1',
        status: CADENCE_LEAD_STATUS.NOT_STARTED,
        lead_cadence_order: 4,
        created_at: '2021-06-08T20:04:000',
        updated_at: '2021-06-08T20:04:000',
      },
      {
        lead_cadence_id: 5,
        lead_id: '4',
        cadence_id: '1',
        status: CADENCE_LEAD_STATUS.NOT_STARTED,
        lead_cadence_order: 5,
        created_at: '2021-06-08T20:05:000',
        updated_at: '2021-06-08T20:05:000',
      },
      {
        lead_cadence_id: 6,
        lead_id: '6',
        cadence_id: '1',
        status: CADENCE_LEAD_STATUS.NOT_STARTED,
        lead_cadence_order: 6,
        created_at: '2021-06-08T20:06:000',
        updated_at: '2021-06-08T20:06:000',
      },
      {
        lead_cadence_id: 7,
        lead_id: '7',
        cadence_id: '1',
        status: CADENCE_LEAD_STATUS.NOT_STARTED,
        lead_cadence_order: 7,
        created_at: '2021-06-08T20:07:000',
        updated_at: '2021-06-08T20:07:000',
      },
      {
        lead_cadence_id: 8,
        lead_id: '8',
        cadence_id: '1',
        status: CADENCE_LEAD_STATUS.NOT_STARTED,
        lead_cadence_order: 8,
        created_at: '2021-06-08T20:08:000',
        updated_at: '2021-06-08T20:08:000',
      },
      {
        lead_cadence_id: 9,
        lead_id: '9',
        cadence_id: '1',
        status: CADENCE_LEAD_STATUS.NOT_STARTED,
        lead_cadence_order: 9,
        created_at: '2021-06-08T20:09:000',
        updated_at: '2021-06-08T20:09:000',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('lead_to_cadence', null, {});
  },
};
