'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('task', 'is_skipped', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      after: 'completed',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('task', 'is_skipped');
  },
};
