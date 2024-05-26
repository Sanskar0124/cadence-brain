'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lead_to_cadence', 'is_bounced', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('lead_to_cadence', 'is_bounced');
  },
};
