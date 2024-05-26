'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addConstraint('settings', {
      type: 'unique',
      name: 'uniqueUsers',
      fields: ['user_id'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint('settings', 'uniqueUsers', {
      type: 'unique',
    });
  },
};
