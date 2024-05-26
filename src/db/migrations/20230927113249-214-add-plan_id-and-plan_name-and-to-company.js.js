'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company', 'plan_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('company', 'plan_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('company', 'plan_id');
    await queryInterface.removeColumn('company', 'plan_name');
  },
};
