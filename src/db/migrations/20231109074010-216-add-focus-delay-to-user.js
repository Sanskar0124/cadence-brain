'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addColumn('user', 'focus_delay', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 30,
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('user', 'focus_delay');
  },
};
