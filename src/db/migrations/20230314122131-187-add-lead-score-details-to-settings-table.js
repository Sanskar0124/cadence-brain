'use strict';

// Utils
const { SETTING_LEVELS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('settings', 'ls_settings_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'skip_settings_id',
    });
    await queryInterface.addColumn('settings', 'ls_setting_priority', {
      type: Sequelize.INTEGER,
      defaultValue: SETTING_LEVELS.ADMIN,
      after: 'skip_setting_priority',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('settings', 'ls_settings_id');
    await queryInterface.removeColumn('settings', 'ls_setting_priority');
  },
};
