'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('salesforce_tokens', {
      salesforce_token_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      encrypted_access_token: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      encrypted_refresh_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      encrypted_instance_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_logged_out: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
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
    await queryInterface.dropTable('salesforce_tokens');
  },
};
