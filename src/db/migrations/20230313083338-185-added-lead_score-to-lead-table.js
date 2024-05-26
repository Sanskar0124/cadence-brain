'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lead', 'lead_score', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('lead', 'lead_warmth', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'cold',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('lead', 'lead_score');
    await queryInterface.removeColumn('lead', 'lead_warmth');
  },
};
