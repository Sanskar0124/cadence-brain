'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.removeConstraint('activity', 'message_id', {
      type: 'unique',
      name: 'message_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.addConstraint('activity', {
      type: 'unique',
      name: 'message_id',
      fields: ['message_id'],
    });
  },
};
