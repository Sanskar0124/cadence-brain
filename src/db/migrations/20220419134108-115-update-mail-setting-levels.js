'use strict';

// Utils
const { SETTING_LEVELS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('unsubscribe_mail_settings', 'level');

    await queryInterface.addColumn('unsubscribe_mail_settings', 'priority', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: SETTING_LEVELS.ADMIN,
    });

    await queryInterface.removeColumn('bounced_mail_settings', 'level');

    await queryInterface.addColumn('bounced_mail_settings', 'priority', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: SETTING_LEVELS.ADMIN,
    });

    await queryInterface.removeColumn('automated_task_settings', 'level');

    await queryInterface.addColumn('automated_task_settings', 'priority', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: SETTING_LEVELS.ADMIN,
    });

    await queryInterface.removeColumn(
      'automated_task_settings',
      'time_between_emails'
    );
    await queryInterface.removeColumn(
      'automated_task_settings',
      'delay_duration'
    );
    await queryInterface.addColumn(
      'automated_task_settings',
      'max_sms_per_day',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 100,
      }
    );

    await queryInterface.addColumn(
      'automated_task_settings',
      'is_wait_time_random',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      }
    );

    await queryInterface.addColumn(
      'automated_task_settings',
      'wait_time_upper_limit',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 60,
      }
    );
    await queryInterface.addColumn(
      'automated_task_settings',
      'wait_time_lower_limit',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 30,
      }
    );

    await queryInterface.addColumn('automated_task_settings', 'delay', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 60,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('unsubscribe_mail_settings', 'level', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn('unsubscribe_mail_settings', 'priority');

    await queryInterface.addColumn('bounced_mail_settings', 'level', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn('bounced_mail_settings', 'priority');

    await queryInterface.addColumn('automated_task_settings', 'level', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn(
      'automated_task_settings',
      'time_between_emails',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'automated_task_settings',
      'delay_duration',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    );
    await queryInterface.removeColumn(
      'automated_task_settings',
      'max_sms_per_day'
    );
    await queryInterface.removeColumn(
      'automated_task_settings',
      'is_wait_time_random'
    );
    await queryInterface.removeColumn(
      'automated_task_settings',
      'wait_time_upper_limit'
    );
    await queryInterface.removeColumn(
      'automated_task_settings',
      'wait_time_lower_limit'
    );
    await queryInterface.removeColumn('automated_task_settings', 'delay');
  },
};
