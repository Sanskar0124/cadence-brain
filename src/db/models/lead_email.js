'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Lead_email extends Model {
    static associate({ Lead }) {
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
    }
  }
  Lead_email.init(
    {
      lem_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'lead_email',
      modelName: 'Lead_email',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Lead_email;
};
