'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Opportunity extends Model {
    static associate({ Account, User, Cadence }) {
      this.belongsTo(Account, { foreignKey: 'account_id' });
      this.belongsTo(User, { foreignKey: 'user_id', sourceKey: 'user_id' });
      this.belongsTo(Cadence, {
        foreignKey: 'cadence_id',
        sourceKey: 'cadence_id',
      });
    }
  }
  Opportunity.init(
    {
      opportunity_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Opportunity must have a name' },
          notEmpty: { msg: 'Opportunity name must not be empty' },
        },
      },
      integration_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      integration_account_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_owner_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      integration_stage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'open',
      },
      close_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      probability: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'opportunity',
      modelName: 'Opportunity',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Opportunity;
};
