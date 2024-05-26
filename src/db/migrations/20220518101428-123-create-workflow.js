'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.createTable('workflow', {
      workflow_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      trigger: {
        // * Validate this with enum while creating workflow
        type: Sequelize.STRING,
        allowNull: false,
      },
      actions: {
        // * This will hold actions for the trigger
        type: Sequelize.JSON,
        allowNull: false,
      },
      allow_edit: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('workflow');
  },
};
