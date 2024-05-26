'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Hubspot_Imports extends Model {
    static associate({ Company }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
    }
  }
  Hubspot_Imports.init(
    {
      hubspot_import_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      contact: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      contact_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'hubspot_imports',
      modelName: 'Hubspot_Imports',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Hubspot_Imports;
};
