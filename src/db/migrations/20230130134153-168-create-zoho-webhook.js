'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'zoho_webhook',
      {
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
      },
      {
        timestamps: true,
        tableName: 'zoho_webhook',
        modelName: 'Zoho_Webhook',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('zoho_webhook');
  },
};
