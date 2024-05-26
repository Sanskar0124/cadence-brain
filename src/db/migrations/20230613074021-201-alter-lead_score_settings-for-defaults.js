'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('lead_score_settings', 'email_clicked', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 20,
    });

    await queryInterface.changeColumn('lead_score_settings', 'email_opened', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10,
    });

    await queryInterface.changeColumn('lead_score_settings', 'email_replied', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 30,
    });

    await queryInterface.changeColumn(
      'lead_score_settings',
      'incoming_call_received',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      }
    );

    await queryInterface.changeColumn(
      'lead_score_settings',
      'incoming_call_received',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      }
    );

    await queryInterface.changeColumn('lead_score_settings', 'sms_clicked', {
      defaultValue: 20,
      allowNull: false,
      type: Sequelize.INTEGER,
    });

    await queryInterface.changeColumn('lead_score_settings', 'outgoing_call', {
      defaultValue: 30,
      allowNull: false,
      type: Sequelize.INTEGER,
    });

    await queryInterface.changeColumn(
      'lead_score_settings',
      'outgoing_call_duration',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 120,
      }
    );

    await queryInterface.changeColumn('lead_score_settings', 'demo_booked', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 40,
    });

    return await queryInterface.changeColumn(
      'lead_score_settings',
      'score_threshold',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 35,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('lead_score_settings', 'email_clicked', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('lead_score_settings', 'email_opened', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('lead_score_settings', 'email_replied', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn(
      'lead_score_settings',
      'incoming_call_received',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    );

    await queryInterface.changeColumn(
      'lead_score_settings',
      'incoming_call_received',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    );

    await queryInterface.changeColumn('lead_score_settings', 'sms_clicked', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('lead_score_settings', 'outgoing_call', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn(
      'lead_score_settings',
      'outgoing_call_duration',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    );

    await queryInterface.changeColumn('lead_score_settings', 'demo_booked', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    return await queryInterface.changeColumn(
      'lead_score_settings',
      'score_threshold',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    );
  },
};
