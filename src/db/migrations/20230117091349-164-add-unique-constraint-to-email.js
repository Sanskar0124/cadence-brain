'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('lead_email', {
      type: 'unique',
      name: 'uniqueEmails',
      fields: ['email_id', 'type', 'lead_id'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint('lead_email', 'uniqueEmails', {
      type: 'unique',
    });
  },
};
