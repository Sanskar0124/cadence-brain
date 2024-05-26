'use strict';
const { NODE_TYPES } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'task_settings',
      [
        {
          priority: 3,
          calls_per_day: 20,
          mails_per_day: 20,
          messages_per_day: 20,
          linkedin_connections_per_day: 5,
          linkedin_messages_per_day: 5,
          linkedin_profiles_per_day: 5,
          linkedin_interacts_per_day: 5,
          data_checks_per_day: 10,
          //reply_tos_per_day: 10,
          cadence_customs_per_day: 10,
          tasks_to_be_added_per_day: 0,
          max_tasks: 100,
          high_priority_split: 80,
          late_settings: JSON.stringify({
            [NODE_TYPES.CALL]: 1 * 24 * 60 * 60 * 1000,
            [NODE_TYPES.MESSAGE]: 1 * 24 * 60 * 60 * 1000,
            [NODE_TYPES.MAIL]: 1 * 24 * 60 * 60 * 1000,
            [NODE_TYPES.LINKEDIN_MESSAGE]: 1 * 24 * 60 * 60 * 1000,
            [NODE_TYPES.LINKEDIN_PROFILE]: 1 * 24 * 60 * 60 * 1000,
            [NODE_TYPES.LINKEDIN_INTERACT]: 1 * 24 * 60 * 60 * 1000,
            [NODE_TYPES.LINKEDIN_CONNECTION]: 1 * 24 * 60 * 60 * 1000,
            [NODE_TYPES.DATA_CHECK]: 1 * 24 * 60 * 60 * 1000,
            [NODE_TYPES.CADENCE_CUSTOM]: 1 * 24 * 60 * 60 * 1000,
            [NODE_TYPES.WHATSAPP]: 1 * 24 * 60 * 60 * 1000,
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
    await queryInterface.bulkDelete('task_settings', null, {});
  },
};
