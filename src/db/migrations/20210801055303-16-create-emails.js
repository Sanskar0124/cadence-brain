'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('email', {
      user_id: {
        type: Sequelize.UUID,
      },
      lead_id: {
        type: Sequelize.INTEGER,
      },
      email_json: {
        type: Sequelize.TEXT,
      },
      sent: {
        type: Sequelize.BOOLEAN,
      },
      message_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      thread_id: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('email');
  },
};
