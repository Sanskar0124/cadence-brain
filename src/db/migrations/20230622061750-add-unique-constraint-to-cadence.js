'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('cadence', {
      type: 'unique',
      name: 'uniqueCadenceNamePerCompany',
      fields: ['name', 'company_id'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint(
      'cadence',
      'uniqueCadenceNamePerCompany',
      {
        type: 'unique',
      }
    );
  },
};
