'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'salesforce_field_map',
      {
        sfm_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        account_map: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        lead_map: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        contact_map: {
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
        tableName: 'salesforce_field_map',
        modelName: 'Salesforce_Field_Map',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('salesforce_field_map');
  },
};
