'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task', 'metadata', {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({ task_reason: '' }),
      after: 'is_skipped',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task', 'metadata');
  },
};
