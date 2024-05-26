'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'user_task',
      'automated_messages_sent_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        after: 'messages_per_day',
      }
    );
    return await queryInterface.addColumn(
      'user_task',
      'automated_mails_sent_per_day',
      {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        after: 'automated_messages_sent_per_day',
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'user_task',
      'automated_messages_sent_per_day'
    );
    return await queryInterface.removeColumn(
      'user_task',
      'automated_mails_sent_per_day'
    );
  },
};
