'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('lead', {
      type: 'unique',
      name: 'salesforce_lead_id',
      fields: ['salesforce_lead_id'],
    });

    return await queryInterface.addConstraint('lead', {
      type: 'unique',
      name: 'salesforce_contact_id',
      fields: ['salesforce_contact_id'],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('lead', 'salesforce_lead_id', {
      type: 'unique',
      name: 'salesforce_lead_id',
    });

    await queryInterface.removeConstraint('lead', 'salesforce_contact_id', {
      type: 'unique',
      name: 'salesforce_contact_id',
    });
  },
};
