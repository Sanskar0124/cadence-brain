'use strict';

// Utils
const { SETTING_LEVELS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('settings', 'skip_settings_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'bounced_settings_id',
    });
    await queryInterface.addColumn('settings', 'skip_setting_priority', {
      type: Sequelize.INTEGER,
      defaultValue: SETTING_LEVELS.ADMIN,
      after: 'bounced_setting_priority',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('settings', 'skip_settings_id');
    await queryInterface.removeColumn('settings', 'skip_setting_priority');
  },
};
