'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // add 'integration_id' column to 'company' table
    await queryInterface.addColumn('company', 'integration_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('company', 'integration_id');
  },
};
