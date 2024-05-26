'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversation', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      from_phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      conv_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conversation');
  },
};
