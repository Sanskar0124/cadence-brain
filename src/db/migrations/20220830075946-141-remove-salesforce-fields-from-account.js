'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    //await queryInterface.removeColumn('account', 'salesforce_account_id');
    //await queryInterface.removeColumn('account', 'salesforce_owner_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('account', 'salesforce_account_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('account', 'salesforce_owner_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
