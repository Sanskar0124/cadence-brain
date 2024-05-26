'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('enrichments', [
      {
        enr_id: 1,
        lusha_action: 'add',
        kaspr_action: 'add',
        is_lusha_activated: true,
        is_kaspr_activated: true,
        is_hunter_activated: true,
        is_dropcontact_activated: true,
        is_snov_activated: true,
        is_linkedin_activated: true,
        default_linkedin_export_type: 'salesforce_lead',
        lusha_linkedin_enabled: false,
        kaspr_linkedin_enabled: false,
        hunter_linkedin_enabled: false,
        lusha_phone: JSON.stringify({
          salesforce_lead: {
            personal_field: 'MobilePhone',
            work_field: 'Phone',
            other_field: null,
          },
          salesforce_contact: {
            personal_field: 'Phone',
            work_field: 'MobilePhone',
            other_field: 'OtherPhone',
          },
        }),
        lusha_email: JSON.stringify({
          salesforce_lead: {
            personal_field: null,
            work_field: 'Email',
            other_field: null,
          },
          salesforce_contact: {
            personal_field: null,
            work_field: 'Email',
            other_field: null,
          },
        }),
        kaspr_phone: JSON.stringify({
          salesforce_lead: {
            fields: ['Phone', 'MobilePhone'],
          },
          salesforce_contact: {
            fields: ['Phone', 'HomePhone', 'OtherPhone', 'MobilePhone'],
          },
        }),
        kaspr_email: JSON.stringify({
          salesforce_lead: {
            fields: ['Email'],
          },
          salesforce_contact: {
            fields: ['Email'],
          },
        }),
        hunter_email: JSON.stringify({
          salesforce_lead: {
            field: 'Email',
          },
          salesforce_contact: {
            field: 'Email',
          },
        }),
        dropcontact_email: JSON.stringify({
          salesforce_lead: {
            fields: ['Email'],
          },
          salesforce_contact: {
            fields: ['Email'],
          },
        }),
        snov_email: JSON.stringify({
          salesforce_lead: {
            fields: ['Email'],
          },
          salesforce_contact: {
            fields: ['Email'],
          },
        }),
        company_id: '4192bff0-e1e0-43ce-a4db-912808c32493',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('enrichments', null, {});
  },
};
