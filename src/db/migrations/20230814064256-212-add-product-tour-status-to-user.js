'use strict';

const { PRODUCT_TOUR_STATUSES } = require('../../utils/enums');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addColumn('user', 'product_tour_status', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: PRODUCT_TOUR_STATUSES.AFTER_ONBOARDING_PENDING,
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('user', 'product_tour_status');
  },
};
