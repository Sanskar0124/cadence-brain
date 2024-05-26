'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Email_Template extends Model {
    static associate({ User, Attachment, Sub_Department, Email, Company }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
      this.hasMany(Attachment, { foreignKey: 'et_id', sourceKey: 'et_id' });
      this.hasMany(Email, { foreignKey: 'et_id' });
      this.belongsTo(Company, { foreignKey: 'company_id' });
    }
  }
  Email_Template.init(
    {
      et_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Email template must have a name' },
          notEmpty: { msg: 'Email template name cannot be empty' },
        },
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Email template must have a subject' },
          notEmpty: { msg: 'Email template subject cannot be empty' },
        },
      },
      body: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        validate: {
          notNull: { msg: 'Email template must have a body' },
          notEmpty: { msg: 'Email template body cannot be empty' },
        },
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
      redirectUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      linkText: {
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
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'email_template',
      modelName: 'Email_Template',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Email_Template;
};
