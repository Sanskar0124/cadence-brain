'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'pipedrive_field_map',
      {
        pfm_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        person_map: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        organization_map: {
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
        tableName: 'pipedrive_field_map',
        modelName: 'Pipedrive_Field_Map',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pipedrive_field_map');
  },
};
