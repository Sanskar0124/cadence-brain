'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.createTable('user_task', {
      user_task_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // * keeping a default value of 10
      calls_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      mails_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      messages_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.dropTable('user_task');
  },
};
