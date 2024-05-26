'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Openai_Log extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  Openai_Log.init(
    {
      openai_log_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      prompt: {
        type: Sequelize.STRING(10000),
        allowNull: false,
      },
      response: {
        type: Sequelize.STRING(10000),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'openai_log',
      modelName: 'Openai_Log',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Openai_Log;
};
