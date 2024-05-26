'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company', 'ringover_team_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addConstraint('company', {
      type: 'unique',
      name: 'ringover_team_id',
      fields: ['ringover_team_id'],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('company', 'ringover_team_id');
  },
};
