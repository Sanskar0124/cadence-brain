'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('User_Task', 'calls_per_day', {
      type: Sequelize.INTEGER,
      defaultValue: 25,
    });
    await queryInterface.changeColumn('User_Task', 'mails_per_day', {
      type: Sequelize.INTEGER,
      defaultValue: 25,
    });

    return await queryInterface.changeColumn('User_Task', 'messages_per_day', {
      type: Sequelize.INTEGER,
      defaultValue: 25,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('User_Task', 'calls_per_day', {
      type: Sequelize.INTEGER,
      defaultValue: 10,
    });
    await queryInterface.changeColumn('User_Task', 'mails_per_day', {
      type: Sequelize.INTEGER,
      defaultValue: 10,
    });

    return await queryInterface.changeColumn('User_Task', 'messages_per_day', {
      type: Sequelize.INTEGER,
      defaultValue: 10,
    });
  },
};
