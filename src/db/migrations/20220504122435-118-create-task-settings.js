'use strict';

// Utils
const { SETTING_LEVELS } = require('../../utils/enums');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task_settings', {
      task_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      calls_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      mails_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      messages_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      linkedins_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      data_checks_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      cadence_customs_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      tasks_to_be_added_per_day: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      max_tasks: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      high_priority_split: {
        type: Sequelize.INTEGER,
        defaultValue: 80,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('settings');
  },
};
