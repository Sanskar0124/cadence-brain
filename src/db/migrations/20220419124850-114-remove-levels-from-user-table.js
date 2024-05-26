'use strict';

// Utils
const { SETTING_LEVELS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user', 'automated_task_setting_level');
    await queryInterface.removeColumn('user', 'bounced_setting_level');
    await queryInterface.removeColumn('user', 'unsubscribe_setting_level');
    await queryInterface.addColumn('user', 'settings_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'automated_task_setting_level', {
      type: Sequelize.STRING,
      defaultValue: SETTING_LEVELS.ADMIN,
    });
    await queryInterface.addColumn('user', 'unsubscribe_setting_level', {
      type: Sequelize.STRING,
      defaultValue: SETTING_LEVELS.ADMIN,
    });
    await queryInterface.addColumn('user', 'bounced_setting_level', {
      type: Sequelize.STRING,
      defaultValue: SETTING_LEVELS.ADMIN,
    });
    await queryInterface.removeColumn('user', 'settings_id');
  },
};
