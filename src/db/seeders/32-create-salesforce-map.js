'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('salesforce_field_map', [
      {
        sfm_id: 1,
        account_map: JSON.stringify({
          country: 'BillingCountry',
          linkedin_url: 'Linkedin_Societe__c',
          name: 'Name',
          phone_number: 'Phone',
          size: 'Effectif__c',
          url: 'Website',
          zip_code: 'BillingPostalCode',
          integration_status: {
            converted: {
              label: 'Converted',
              value: 'Converted',
            },
            disqualified: {
              label: 'Disqualified',
              value: 'Disqualified',
            },
            name: 'OnBoarding__c',
            picklist_values: [
              {
                label: 'Disqualified',
                value: 'Disqualified',
              },
              {
                label: 'New',
                value: 'New',
              },
              {
                label: 'Recent',
                value: 'Recent',
              },
              {
                label: 'Progress',
                value: 'Progress',
              },
              {
                label: 'Converted',
                value: 'Converted',
              },
            ],
          },
        }),
        lead_map: JSON.stringify({
          emails: ['Email'],
          first_name: 'FirstName',
          job_position: 'Title',
          last_name: 'LastName',
          linkedin_url: 'Linkedin__c',
          phone_numbers: ['Phone', 'MobilePhone'],
          source_site: 'Source_site__c',
          company: 'Company',
          size: 'Effectif_Linkedin__c',
          url: 'Website',
          country: 'Country',
          zip_code: 'PostalCode',
          integration_status: {
            converted: {
              label: 'Closed - Not Converted',
              value: 'Closed - Not Converted',
            },
            disqualified: {
              label: 'Open - Not Contacted',
              value: 'Open - Not Contacted',
            },
            name: 'Status',
            picklist_values: [
              {
                label: 'Open - Not Contacted',
                value: 'Open - Not Contacted',
              },
              {
                label: 'Working - Contacted',
                value: 'Working - Contacted',
              },
              {
                label: 'Closed - Converted',
                value: 'Closed - Converted',
              },
              {
                label: 'Closed - Not Converted',
                value: 'Closed - Not Converted',
              },
            ],
          },
        }),
        contact_map: JSON.stringify({
          emails: ['Email'],
          first_name: 'FirstName',
          job_position: 'Title',
          last_name: 'LastName',
          linkedin_url: 'URL_Profil_Linkedin__c',
          phone_numbers: [
            'Phone',
            'MobilePhone',
            'OtherPhone',
            'HomePhone',
            'AssistantPhone',
          ],
          source_site: 'Source_site__c',
        }),
        company_settings_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    //return queryInterface.sequelize.query(
    //'UPDATE company_settings SET sfm_id=1 WHERE company_settings_id=1'
    //);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('salesforce_field_map', null, {});
  },
};
