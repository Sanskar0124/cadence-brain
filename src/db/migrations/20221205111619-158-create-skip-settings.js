'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('skip_settings', {
      skip_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      skip_allowed_tasks: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          mail: true,
        },
      },
      skip_reasons: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('skip_settings');
  },
};
