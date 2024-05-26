'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('automated_task_settings', 'start_hour', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '09:00',
    });

    await queryInterface.changeColumn('automated_task_settings', 'end_hour', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '18:00',
    });

    await queryInterface.changeColumn(
      'bounced_mail_settings',
      'automatic_bounced_data',
      {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          mail: true,
        }),
      }
    );

    await queryInterface.changeColumn(
      'bounced_mail_settings',
      'semi_automatic_bounced_data',
      {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          mail: true,
        }),
      }
    );

    await queryInterface.changeColumn(
      'unsubscribe_mail_settings',
      'semi_automatic_unsubscribed_data',
      {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          mail: true,
        }),
      }
    );

    await queryInterface.changeColumn(
      'unsubscribe_mail_settings',
      'automatic_unsubscribed_data',
      {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          mail: true,
        }),
      }
    );

    await queryInterface.changeColumn(
      'task_settings',
      'linkedin_connections_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      }
    );

    await queryInterface.changeColumn(
      'task_settings',
      'linkedin_messages_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      }
    );

    await queryInterface.changeColumn(
      'task_settings',
      'linkedin_profiles_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      }
    );

    await queryInterface.changeColumn(
      'task_settings',
      'linkedin_interacts_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('automated_task_settings', 'start_hour', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('automated_task_settings', 'end_hour', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn(
      'bounced_mail_settings',
      'automatic_bounced_data',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );

    await queryInterface.changeColumn(
      'bounced_mail_settings',
      'semi_automatic_bounced_data',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );

    await queryInterface.changeColumn(
      'unsubscribe_mail_settings',
      'semi_automatic_unsubscribed_data',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );

    await queryInterface.changeColumn(
      'unsubscribe_mail_settings',
      'automatic_unsubscribed_data',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );

    await queryInterface.changeColumn(
      'task_settings',
      'linkedin_connections_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 20,
      }
    );

    await queryInterface.changeColumn(
      'task_settings',
      'linkedin_messages_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 20,
      }
    );

    await queryInterface.changeColumn(
      'task_settings',
      'linkedin_profiles_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 20,
      }
    );

    await queryInterface.changeColumn(
      'task_settings',
      'linkedin_interacts_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 20,
      }
    );
  },
};
