'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('new_zoho_webhook', {
      channel_id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company_id: {
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

    await queryInterface.sequelize.query(
      `INSERT INTO new_zoho_webhook SELECT * FROM zoho_webhook`
    );

    await queryInterface.dropTable('zoho_webhook');

    await queryInterface.renameTable('new_zoho_webhook', 'zoho_webhook');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('zoho_webhook', 'new_zoho_webhook');

    await queryInterface.createTable('zoho_webhook', {
      channel_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.INTEGER,
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

    await queryInterface.sequelize.query(
      `INSERT INTO zoho_webhook SELECT * FROM new_zoho_webhook`
    );

    await queryInterface.dropTable('new_zoho_webhook');
  },
};
