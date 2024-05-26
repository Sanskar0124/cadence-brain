'use strict';
// Utils
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Message_Template extends Model {
    static associate({ User, Sub_Department, Company }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
      this.belongsTo(Company, { foreignKey: 'company_id' });
    }
  }
  Message_Template.init(
    {
      mt_id: {
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
      tableName: 'message_template',
      modelName: 'Message_Template',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Message_Template;
};
