'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('task', 'skip_time', {
      type: Sequelize.BIGINT,
      allowNull: true,
      after: 'complete_time',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('task', 'skip_time');
  },
};
