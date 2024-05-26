'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.changeColumn('user', 'focus_delay', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.changeColumn('user', 'focus_delay', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 30,
    });
  },
};
