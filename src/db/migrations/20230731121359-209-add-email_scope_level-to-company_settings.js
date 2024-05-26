'use strict';

// * Utils
const { MAIL_SCOPE_LEVEL } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('company_settings', 'email_scope_level', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: MAIL_SCOPE_LEVEL.STANDARD,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('company_settings', 'email_scope_level');
  },
};
