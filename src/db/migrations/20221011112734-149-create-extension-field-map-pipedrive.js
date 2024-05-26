'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('efm_pipedrive', {
      efm_pipedrive_id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('efm_pipedrive');
  },
};
