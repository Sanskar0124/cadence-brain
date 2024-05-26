'use strict';
// Packages
const { Model } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class Support_Agent extends Model {}
  Support_Agent.init(
    {
      sa_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: { msg: 'User must have an email address' },
          notEmpty: { msg: 'User email address must not be empty' },
          isEmail: { msg: 'Enter a valid email address.' },
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'support_agent',
      modelName: 'Support_Agent',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Support_Agent;
};
