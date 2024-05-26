'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('lead', {
      type: 'unique',
      name: 'uniqueLeads',
      fields: ['integration_id', 'company_id', 'integration_type'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint('lead', 'uniqueLeads', {
      type: 'unique',
    });
  },
};
