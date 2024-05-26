'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('tag', [
      {
        tag_id: 1,
        tag_name: 'urgent',
        cadence_id: 1,
      },
      {
        tag_id: 2,
        tag_name: 'test',
        cadence_id: 1,
      },
      {
        tag_id: 3,
        tag_name: 'test',
        cadence_id: 2,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('tag', null, {});
  },
};
