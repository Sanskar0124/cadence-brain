'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeIndex('lead', '`lead_user_idx`');

    await queryInterface.addIndex('lead', ['user_id', 'status'], {
      name: 'lead_user_status_idx',
    });

    await queryInterface.addIndex('task', ['status', 'node_id'], {
      name: 'status_node_idx',
    });

    await queryInterface.addIndex('lead_to_cadence', ['status_node_id'], {
      name: 'status_node_id_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addIndex('lead', ['user_id'], {
      name: 'lead_user_idx',
    });

    await queryInterface.removeIndex('lead', '`lead_user_status_idx`');

    await queryInterface.removeIndex('task', '`status_node_idx`');

    await queryInterface.removeIndex('lead_to_cadence', '`status_node_id_idx`');
  },
};
