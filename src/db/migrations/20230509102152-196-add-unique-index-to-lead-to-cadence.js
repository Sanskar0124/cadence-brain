'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('lead_to_cadence', {
      type: 'unique',
      name: 'uniqueLinks',
      fields: ['lead_id', 'cadence_id'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint(
      'lead_to_cadence',
      'uniqueLinks',
      {
        type: 'unique',
      }
    );
  },
};
