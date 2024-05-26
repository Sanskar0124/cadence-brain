'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company', 'region', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'eu',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('company', 'region');
  },
};
