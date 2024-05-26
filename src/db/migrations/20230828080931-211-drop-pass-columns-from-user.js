'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'password');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
