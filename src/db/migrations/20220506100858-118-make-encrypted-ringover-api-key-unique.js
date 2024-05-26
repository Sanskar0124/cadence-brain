'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addConstraint('user_token', {
      type: 'unique',
      name: 'encrypted_ringover_api_key',
      fields: ['encrypted_ringover_api_key'],
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeConstraint(
      'user_token',
      'encrypted_ringover_api_key',
      {
        type: 'unique',
        name: 'encrypted_ringover_api_key',
      }
    );
  },
};
