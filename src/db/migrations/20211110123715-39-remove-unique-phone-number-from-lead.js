'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.removeConstraint('lead', 'phone_number', {
      type: 'unique',
      name: 'phone_number',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.addConstraint('lead', {
      type: 'unique',
      name: 'phone_number',
      fields: ['phone_number'],
    });
  },
};
