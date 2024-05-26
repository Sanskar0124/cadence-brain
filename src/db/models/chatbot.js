'use strict';

// Utils
const { CHATBOT_THREAD_STATUS } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Chatbot extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  Chatbot.init(
    {
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      slack_thread_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      issue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      assigned_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: CHATBOT_THREAD_STATUS.PENDING,
      },
      resolution_time: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      support_agent_access_start_time: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'chatbot',
      modelName: 'Chatbot',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Chatbot;
};
