'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('lead_phone_number', ['lead_id'], {
      name: 'idx_lead_phone_number_lead_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'lead_phone_number',
      'idx_lead_phone_number_lead_id'
    );
  },
};
