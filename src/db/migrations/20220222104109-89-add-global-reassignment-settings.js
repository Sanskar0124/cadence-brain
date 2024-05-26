'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'company_settings',
      'contact_reassignment_rule',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'change_contact_and_account_owner',
        after: 'unsubscribe_from_all_cadences',
      }
    );

    await queryInterface.addColumn(
      'company_settings',
      'account_reassignment_rule',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'change_only_account_owner',
        after: 'contact_reassignment_rule',
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'company_settings',
      'contact_reassignment_rule'
    );
    return await queryInterface.removeColumn(
      'company_settings',
      'account_reassignment_rule'
    );
  },
};
