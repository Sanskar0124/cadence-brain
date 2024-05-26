'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.removeConstraint(
      'user',
      'salesforce_owner_id',
      {
        type: 'unique',
        name: 'salesforce_owner_id',
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.addConstraint('user', {
      type: 'unique',
      name: 'salesforce_owner_id',
      fields: ['salesforce_owner_id'],
    });
  },
};
