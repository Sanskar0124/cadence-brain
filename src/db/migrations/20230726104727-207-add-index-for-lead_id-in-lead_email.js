'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('lead_email', ['lead_id'], {
      name: 'idx_lead_email_lead_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('lead_email', 'idx_lead_email_lead_id');
  },
};
