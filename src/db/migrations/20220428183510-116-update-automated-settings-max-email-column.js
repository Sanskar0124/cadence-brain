'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'automated_task_settings',
      'new_max_emails_per_day',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
      }
    );
    await queryInterface.removeColumn(
      'automated_task_settings',
      'max_emails_per_day'
    );

    await queryInterface.renameColumn(
      'automated_task_settings',
      'new_max_emails_per_day',
      'max_emails_per_day'
    );
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.changeColumn(
      'automated_task_settings',
      'max_emails_per_day',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    );
  },
};
