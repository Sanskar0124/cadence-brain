'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex(
      'lead_to_cadence',
      ['lead_id', 'cadence_id', 'status'],
      {
        name: 'lead_to_cadence_status_idx',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'lead_to_cadence',
      'lead_to_cadence_status_idx'
    );
  },
};
