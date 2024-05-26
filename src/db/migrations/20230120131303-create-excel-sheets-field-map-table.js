'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'excel_field_map',
      {
        esfm_id: {
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
        tableName: 'excel_field_map',
        modelName: 'Excel_Field_Map',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('excel_field_map');
  },
};
