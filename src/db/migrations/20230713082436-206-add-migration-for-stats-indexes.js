'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('lead', ['status_update_timestamp'], {
      name: 'lead_status_update_idx',
    });

    await queryInterface.addIndex('task', ['start_time'], {
      name: 'task_start_time_idx',
    });

    await queryInterface.addIndex('task', ['complete_time'], {
      name: 'task_complete_time_idx',
    });

    await queryInterface.addIndex('task', ['skip_time'], {
      name: 'task_skip_time_idx',
    });

    await queryInterface.addIndex('lead_to_cadence', ['lead_id'], {
      name: 'lead_to_cadence_lead_idx',
    });

    await queryInterface.addIndex('user', ['company_id'], {
      name: 'user_company_idx',
    });

    await queryInterface.addIndex('lead', ['user_id'], {
      name: 'lead_user_idx',
    });

    await queryInterface.addIndex(
      'lead_to_cadence',
      ['lead_id', 'cadence_id'],
      {
        name: 'idx_lead_cadence',
      }
    );

    await queryInterface.addIndex('node', ['cadence_id'], {
      name: 'node_cadence_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('lead', '`lead_status_update_idx`');
    await queryInterface.removeIndex('task', '`task_start_time_idx`');
    await queryInterface.removeIndex('task', '`task_complete_time_idx`');
    await queryInterface.removeIndex('task', '`task_skip_time_idx`');
    await queryInterface.removeIndex(
      'lead_to_cadence',
      'lead_to_cadence_lead_idx'
    );
    await queryInterface.removeIndex('user', '`user_company_idx`');
    await queryInterface.removeIndex('lead', '`lead_user_idx`');
    await queryInterface.removeIndex('lead_to_cadence', '`idx_lead_cadence`');
    await queryInterface.removeIndex('node_cadence_idx', '`node`');
  },
};
