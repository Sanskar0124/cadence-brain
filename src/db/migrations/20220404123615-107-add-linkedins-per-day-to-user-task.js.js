'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addColumn('User_Task', 'linkedins_per_day', {
      // will be stored as percentage
      after: 'messages_per_day',
      type: Sequelize.INTEGER,
      defaultValue: 25,
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('User_Task', 'linkedins_per_day');
  },
};
