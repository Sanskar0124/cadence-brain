'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'efm_googlesheets',
      {
        efm_googlesheets_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        lead_map: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        company_settings_id: {
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
      },
      {
        timestamps: true,
        tableName: 'efm_googleSheets',
        modelName: 'EFM_GoogleSheets',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('efm_googlesheets');
  },
};
