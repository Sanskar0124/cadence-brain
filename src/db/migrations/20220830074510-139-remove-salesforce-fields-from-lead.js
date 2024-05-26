'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    //await queryInterface.removeColumn('lead', 'salesforce_lead_id');
    //await queryInterface.removeColumn('lead', 'salesforce_contact_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('lead', 'salesforce_lead_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('lead', 'salesforce_contact_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
