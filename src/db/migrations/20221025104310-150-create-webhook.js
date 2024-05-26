'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webhook', {
      webhook_id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      webhook_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      http_method: {
        type: Sequelize.Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(3000),
        allowNull: false,
      },
      company_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('webhook');
  },
};
