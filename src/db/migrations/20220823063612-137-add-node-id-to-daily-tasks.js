'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('daily_tasks', 'node_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      after: 'user_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('daily_tasks', 'node_id');
  },
};
