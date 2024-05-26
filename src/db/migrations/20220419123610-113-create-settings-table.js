'use strict';

// Utils
const { SETTING_LEVELS } = require('../../utils/enums');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      settings_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      automated_task_setting_priority: {
        type: Sequelize.INTEGER,
        defaultValue: SETTING_LEVELS.ADMIN,
      },
      unsubscribe_setting_priority: {
        type: Sequelize.INTEGER,
        defaultValue: SETTING_LEVELS.ADMIN,
      },
      bounced_setting_priority: {
        type: Sequelize.INTEGER,
        defaultValue: SETTING_LEVELS.ADMIN,
      },
      at_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      unsubscribe_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bounced_settings_id: {
        type: Sequelize.INTEGER,
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
