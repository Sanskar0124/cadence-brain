'use strict';

const { WORKFLOW_TRIGGERS, WORKFLOW_ACTIONS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('workflow', [
      {
        workflow_id: 1,
        trigger: WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES,
        actions: JSON.stringify({
          [WORKFLOW_ACTIONS.STOP_CADENCE]: '',
        }),
        company_id: '4192bff0-e1e0-43ce-a4db-912808c32493',
        cadence_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('workflow', null, {});
  },
};
