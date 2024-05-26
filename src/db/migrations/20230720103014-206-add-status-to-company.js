'use strict';

const { COMPANY_STATUS } = require('../../utils/enums');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addColumn('company', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: COMPANY_STATUS.NOT_CONFIGURED,
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('company', 'status');
  },
};
