'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_task', 'lusha_calls_per_month', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('user_task', 'kaspr_calls_per_month', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('user_task', 'hunter_calls_per_month', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('user_task', 'dropcontact_calls_per_month', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('user_task', 'snov_calls_per_month', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_task', 'lusha_calls_per_month');
    await queryInterface.removeColumn('user_task', 'kaspr_calls_per_month');
    await queryInterface.removeColumn('user_task', 'hunter_calls_per_month');
    await queryInterface.removeColumn(
      'user_task',
      'dropcontact_calls_per_month'
    );
    await queryInterface.removeColumn('user_task', 'snov_calls_per_month');
  },
};
