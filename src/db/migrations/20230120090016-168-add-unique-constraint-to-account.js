'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('account', {
      type: 'unique',
      name: 'uniqueAccounts',
      fields: ['integration_id', 'company_id', 'integration_type'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint('account', 'uniqueAccounts', {
      type: 'unique',
    });
  },
};
