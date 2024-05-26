'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lead_email', 'type', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'email_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('lead_email', 'type');
  },
};
