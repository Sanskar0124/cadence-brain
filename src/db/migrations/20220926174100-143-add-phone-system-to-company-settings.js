'use strict';

//Utils
const { PHONE_SYSTEM_TYPE } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('company_settings', 'phone_system', {
      type: Sequelize.STRING,
      defaultValue: PHONE_SYSTEM_TYPE.DEFAULT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('company_settings', 'phone_system');
  },
};
