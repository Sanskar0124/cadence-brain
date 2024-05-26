'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bounced_mail_settings', {
      bounced_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      level: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      semi_automatic_bounced_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      automatic_bounced_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      company_id: {
        type: Sequelize.UUID,
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
    await queryInterface.dropTable('bounced_mail_settings');
  },
};
