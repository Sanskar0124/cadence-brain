'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addColumn('user', 'product_tour_step', {
      type: Sequelize.JSON,
      defaultValue: {},
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('user', 'product_tour_step');
  },
};
