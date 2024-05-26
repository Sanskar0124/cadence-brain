'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('company', 'organization_url');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('company', 'organization_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
