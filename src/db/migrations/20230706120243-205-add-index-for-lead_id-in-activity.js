'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('activity', ['lead_id'], {
      name: 'activity_lead_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('activity', '`activity_lead_index`');
  },
};
