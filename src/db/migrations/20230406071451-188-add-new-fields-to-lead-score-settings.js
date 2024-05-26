'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lead_score_settings', 'reset_period', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('lead_score_settings', 'unsubscribe', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('lead_score_settings', 'bounced_mail', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('lead_score_settings', 'reset_period');
    await queryInterface.removeColumn('lead_score_settings', 'unsubscribe');
    await queryInterface.removeColumn('lead_score_settings', 'bounced_mail');
  },
};
