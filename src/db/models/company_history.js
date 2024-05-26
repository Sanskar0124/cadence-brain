'use strict';

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Company_History extends Model {
    static associate({ Company }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
    }
  }
  Company_History.init(
    {
      company_history_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      change_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      change_option: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      previous_value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      new_value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'company_history',
      modelName: 'Company_History',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Company_History;
};
