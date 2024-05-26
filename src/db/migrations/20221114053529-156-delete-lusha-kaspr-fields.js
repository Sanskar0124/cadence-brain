'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_lead_personal_number_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_lead_work_number_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_lead_other_number_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_lead_personal_email_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_lead_work_email_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_lead_other_email_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_contact_personal_number_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_contact_work_number_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_contact_other_number_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_contact_personal_email_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_contact_work_email_field'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'lusha_contact_other_email_field'
    );
    await queryInterface.removeColumn('enrichments', 'kaspr_lead_phone_fields');
    await queryInterface.removeColumn('enrichments', 'kaspr_lead_email_fields');
    await queryInterface.removeColumn(
      'enrichments',
      'kaspr_contact_phone_fields'
    );
    await queryInterface.removeColumn(
      'enrichments',
      'kaspr_contact_email_fields'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'enrichments',
      'lusha_lead_personal_number_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_lead_work_number_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_lead_other_number_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_lead_personal_email_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_lead_work_email_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_lead_other_email_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_contact_personal_number_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_contact_work_number_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_contact_other_number_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_contact_personal_email_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_contact_work_email_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'lusha_contact_other_email_field',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn('enrichments', 'kaspr_lead_phone_fields', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn('enrichments', 'kaspr_lead_email_fields', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn(
      'enrichments',
      'kaspr_contact_phone_fields',
      {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      }
    );
    await queryInterface.addColumn(
      'enrichments',
      'kaspr_contact_email_fields',
      {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      }
    );
  },
};
