'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addConstraint('activity', {
      type: 'unique',
      name: 'message_id',
      fields: ['message_id'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint('activity', 'message_id', {
      type: 'unique',
      name: 'message_id',
    });
  },
};
