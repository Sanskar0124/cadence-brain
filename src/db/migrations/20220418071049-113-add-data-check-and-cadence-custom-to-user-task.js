'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_task', 'data_checks_per_day', {
      // will be stored as percentage
      type: Sequelize.INTEGER,
      defaultValue: 10,
      after: 'linkedins_per_day',
    });
    return await queryInterface.addColumn(
      'user_task',
      'cadence_customs_per_day',
      {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 10,
        after: 'data_checks_per_day',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_task', 'cadence_customs_per_day');

    await queryInterface.removeColumn('user_task', 'data_checks_per_day');
  },
};
