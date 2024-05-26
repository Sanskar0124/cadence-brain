'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('company_settings', 'sf_activity_to_log', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: JSON.stringify({
        CALL: {
          enabled: false,
        },
        SMS: {
          enabled: false,
        },
        MAIL: {
          enabled: true,
        },
        CALENDAR: {
          enabled: true,
        },
        NOTE: {
          enabled: false,
        },
      }),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('company_settings', 'sf_activity_to_log');
  },
};
