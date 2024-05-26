'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('account', 'integration_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('account', 'integration_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      'update account set integration_id=salesforce_account_id;'
    );
    await queryInterface.sequelize.query(
      'update account set integration_type="salesforce_lead_account" where salesforce_account_id is NULL;'
    );
    await queryInterface.sequelize.query(
      'update account set integration_type="salesforce_account" where salesforce_account_id is not NULL;'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('account', 'integration_type');
    await queryInterface.removeColumn('account', 'integration_id');
  },
};
