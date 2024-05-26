'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task_settings', 'reply_tos_per_day');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('task_settings', 'reply_tos_per_day', {
      type: Sequelize.INTEGER,
      defaultValue: 10,
    });
  },
};
