'use strict';
// Packages
const { Model } = require('sequelize');
const { WORKFLOW_DEFAULT_NAMES } = require('../../utils/enums');

module.exports = (sequelize, Sequelize) => {
  class Workflow extends Model {
    static associate({ Cadence, Company }) {
      this.belongsTo(Cadence, {
        foreignKey: 'cadence_id',
        sourceKey: 'cadence_id',
      });
      this.belongsTo(Company, {
        foreignKey: 'company_id',
        sourceKey: 'company_id',
      });
    }
  }
  Workflow.init(
    {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        //defaultValue: sequelize.literal('trigger')
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
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'workflow',
      modelName: 'Workflow',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Workflow;
};
