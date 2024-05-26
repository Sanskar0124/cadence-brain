'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task_settings', 'linkedins_per_day');

    await queryInterface.addColumn(
      'task_settings',
      'linkedin_connections_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 20,
        after: 'cadence_customs_per_day',
      }
    );
    await queryInterface.addColumn(
      'task_settings',
      'linkedin_messages_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 20,
        after: 'cadence_customs_per_day',
      }
    );
    await queryInterface.addColumn(
      'task_settings',
      'linkedin_profiles_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 20,
        after: 'cadence_customs_per_day',
      }
    );
    await queryInterface.addColumn(
      'task_settings',
      'linkedin_interacts_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 20,
        after: 'cadence_customs_per_day',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('task_settings', 'linkedins_per_day', {
      type: Sequelize.INTEGER,
      defaultValue: 20,
      after: 'cadence_customs_per_day',
    });
    await queryInterface.removeColumn(
      'task_settings',
      'linkedin_connections_per_day'
    );
    await queryInterface.removeColumn(
      'task_settings',
      'linkedin_messages_per_day'
    );
    await queryInterface.removeColumn(
      'task_settings',
      'linkedin_profiles_per_day'
    );
    await queryInterface.removeColumn(
      'task_settings',
      'linkedin_interacts_per_day'
    );
  },
};
