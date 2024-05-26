'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('recent_action', {
      type: 'unique',
      name: 'uniqueRecentAction',
      fields: ['cadence_id', 'user_id'],
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint(
      'recent_action',
      'uniqueRecentAction',
      {
        type: 'unique',
      }
    );
  },
};
