'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('email', ['node_id', 'lead_id'], {
      name: 'node_lead_idx',
    });
    await queryInterface.addIndex('task', ['node_id', 'lead_id'], {
      name: 'node_lead_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('email', 'node_lead_idx');
    await queryInterface.removeIndex('task', 'node_lead_idx');
  },
};
