'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('lead', ['company_id'], {
      name: 'lead_company_idx',
    });
    await queryInterface.addIndex('account', ['company_id'], {
      name: 'account_company_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('lead', '`lead_company_idx`');
    await queryInterface.removeIndex('account', '`account_company_idx`');
  },
};
