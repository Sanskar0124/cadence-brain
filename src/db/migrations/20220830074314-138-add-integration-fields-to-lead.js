'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lead', 'integration_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('lead', 'integration_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // * Salesforce Leads
    await queryInterface.sequelize.query(
      'update `lead` set integration_id=salesforce_lead_id where salesforce_contact_id IS NULL;'
    );
    await queryInterface.sequelize.query(
      'update `lead` set integration_type="salesforce_lead"  where salesforce_contact_id IS NULL;'
    );

    // * Salesforce Contacts
    await queryInterface.sequelize.query(
      'update `lead` set integration_id=salesforce_contact_id where salesforce_lead_id IS NULL;'
    );
    await queryInterface.sequelize.query(
      'update `lead` set integration_type="salesforce_contact" where salesforce_lead_id IS NULL;'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('lead', 'integration_type');
    await queryInterface.removeColumn('lead', 'integration_id');
  },
};
