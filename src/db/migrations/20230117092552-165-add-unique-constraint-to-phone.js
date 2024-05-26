'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('lead_phone_number', {
      type: 'unique',
      name: 'uniquePhoneNumbers',
      fields: ['phone_number', 'type', 'lead_id'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint(
      'lead_phone_number',
      'uniquePhoneNumbers',
      {
        type: 'unique',
      }
    );
  },
};
