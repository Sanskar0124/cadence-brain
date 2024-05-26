'use strict';

const { MAIL_INTEGRATION_TYPES } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'company_settings',
      'mail_integration_type',
      {
        type: Sequelize.STRING(100),
        values: Object.values(MAIL_INTEGRATION_TYPES),
        allowNull: true,
        defaultValue: MAIL_INTEGRATION_TYPES.GOOGLE,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('company_settings', 'mail_integration_type');
  },
};
