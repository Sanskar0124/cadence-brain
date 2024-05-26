'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addConstraint('daily_tasks', {
      type: 'unique',
      name: 'uniqueTasks',
      fields: ['task_id'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint('daily_tasks', 'uniqueTasks', {
      type: 'unique',
    });
  },
};
