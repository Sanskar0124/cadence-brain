'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addConstraint('activity', {
      type: 'unique',
      name: 'uniqueActivity',
      fields: ['message_id', 'type'],
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeConstraint('activity', 'uniqueActivity', {
      type: 'unique',
    });
  },
};
