'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'lead_score_settings',
      {
        ls_settings_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        priority: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        company_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        sd_id: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        total_score: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 10,
        },
        email_clicked: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        email_opened: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        email_replied: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        incoming_call_received: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        sms_clicked: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        outgoing_call: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        outgoing_call_duration: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        demo_booked: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status_update: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        score_threshold: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 10,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date(),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date(),
        },
      },
      {
        timestamps: true,
        tableName: 'lead_score_settings',
        modelName: 'Lead_Score_Settings',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('');
  },
};
