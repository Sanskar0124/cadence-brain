'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('efm_googlesheets', [
      {
        efm_googlesheets_id: 1,
        lead_map: JSON.stringify({
          emails: ['Work Email', 'Home Email', 'Other Email'],
          first_name: 'First Name',
          job_position: 'Job Position',
          last_name: 'Last Name',
          full_name: 'Full Name',
          linkedin_url: 'Linkedin URL',
          phone_numbers: ['Work Phone', 'Home Phone', 'Other Phone'],
          source_site: 'Source Site',
          lead_id: 'Lead ID',
          integration_id: 'Integration ID',
          type: 'Type',
          // cadence_id: 'Cadence ID',
          status: 'Status',
          primary_email: 'Primary Email',
          primary_phone: 'Primary Phone',
          owner_integration_id: 'User GSheets ID',
          company: 'Company',
          size: 'Size',
          url: 'Company Website',
          country: 'Country',
          zip_code: 'Zip',
          comment: 'Comment',
          account_phone_number: 'Company Phone',
        }),
        company_settings_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('efm_googlesheets', null, {});
  },
};
