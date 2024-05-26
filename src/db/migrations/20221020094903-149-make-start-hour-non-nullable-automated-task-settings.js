'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('automated_task_settings', 'start_hour', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '09:00',
    });

    await queryInterface.changeColumn('automated_task_settings', 'end_hour', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '18:00',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('automated_task_settings', 'start_hour', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '09:00',
    });

    await queryInterface.changeColumn('automated_task_settings', 'end_hour', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '18:00',
    });
  },
};
