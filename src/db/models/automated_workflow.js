'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class AutomatedWorkflow extends Model {
    static associate({ Company }) {
      this.belongsTo(Company, {
        foreignKey: 'company_id',
        sourceKey: 'company_id',
      });
    }
  }
  AutomatedWorkflow.init(
    {
      aw_id: {
        allowNull: false,
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
      is_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'automated_workflow',
      modelName: 'Automated_Workflow',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return AutomatedWorkflow;
};
