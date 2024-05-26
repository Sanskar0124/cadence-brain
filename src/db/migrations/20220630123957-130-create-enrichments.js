'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enrichments', {
      enr_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      lusha_action: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kaspr_action: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_lusha_activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_kaspr_activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lusha_lead_personal_number_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_lead_work_number_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_lead_other_number_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_lead_personal_email_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_lead_work_email_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_lead_other_email_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kaspr_lead_phone_fields: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      kaspr_lead_email_fields: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      lusha_contact_personal_number_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_contact_work_number_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_contact_other_number_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_contact_personal_email_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_contact_work_email_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lusha_contact_other_email_field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kaspr_contact_phone_fields: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      kaspr_contact_email_fields: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('enrichments');
  },
};
