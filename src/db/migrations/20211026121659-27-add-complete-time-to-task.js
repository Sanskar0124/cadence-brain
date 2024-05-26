'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('task', 'complete_time', {
      type: Sequelize.BIGINT,
      allowNull: true,
      after: 'start_time',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('task', 'complete_time');
  },
};
