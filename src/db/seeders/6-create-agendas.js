'use strict';
const { AGENDA_TYPE } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Agenda',
      [
        {
          agenda_id: 1,
          name: 'first1 last1',
          completed: false,
          type: AGENDA_TYPE.VOICE_CALL,
          scheduled: new Date().getTime(),
          lead_id: 1,
          created_at: '2021-06-08T20:00:000',
          updated_at: '2021-06-08T20:00:000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Agenda', null, {});
  },
};
