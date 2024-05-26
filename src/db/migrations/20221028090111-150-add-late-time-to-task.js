'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task', 'late_time', {
      type: Sequelize.BIGINT,
      allowNull: true,
      after: 'start_time',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task', 'late_time');
  },
};
