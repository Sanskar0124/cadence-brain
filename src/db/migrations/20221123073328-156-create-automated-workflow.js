'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('automated_workflow', {
      aw_id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      rule_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      trigger: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      filter: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      actions: {
        type: Sequelize.JSON,
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('automated_workflow');
  },
};
