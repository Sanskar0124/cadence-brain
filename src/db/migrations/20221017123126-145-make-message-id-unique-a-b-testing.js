'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addConstraint('a_b_testing', {
      type: 'unique',
      name: 'message_id',
      fields: ['message_id'],
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeConstraint('a_b_testing', 'message_id', {
      type: 'unique',
      name: 'message_id',
    });
  },
};
