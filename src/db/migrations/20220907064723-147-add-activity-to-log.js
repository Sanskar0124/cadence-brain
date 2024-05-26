'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company_settings', 'activity_to_log', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'sf_activity_to_log',
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
    await queryInterface.sequelize.query(
      `update company_settings set activity_to_log=sf_activity_to_log;`
    );
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn(
      'company_settings',
      'activity_to_log'
    );
  },
};
