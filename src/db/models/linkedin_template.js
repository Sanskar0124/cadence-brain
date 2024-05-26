'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Linkedin_Template extends Model {
    static associate({ User, Sub_Department, Company }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
      this.belongsTo(Company, { foreignKey: 'company_id' });
    }
  }
  Linkedin_Template.init(
    {
      lt_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      level: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      used: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'linkedin_template',
      modelName: 'Linkedin_Template',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Linkedin_Template;
};
