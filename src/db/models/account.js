'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Account extends Model {
    static associate({ Lead, User, Company }) {
      this.hasMany(Lead, { foreignKey: 'account_id' });
      this.belongsTo(User, { foreignKey: 'user_id', sourceKey: 'user_id' });
      this.belongsTo(Company, {
        foreignKey: 'company_id',
        sourceKey: 'company_id',
      });
    }
  }
  Account.init(
    {
      account_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Account must have a name' },
          notEmpty: { msg: 'Account name must not be empty' },
        },
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      linkedin_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      size: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      zipcode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesforce_account_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_id: {
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
      integration_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'account',
      modelName: 'Account',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Account;
};
