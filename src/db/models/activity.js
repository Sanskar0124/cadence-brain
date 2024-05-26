'use strict';
// Utils
const { ACTIVITY_TYPE } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Activity extends Model {
    static associate({
      Lead,
      Email,
      Message,
      Cadence,
      Node,
      User,
      Task,
      Lead_Score_Reasons,
    }) {
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
      this.belongsTo(Cadence, { foreignKey: 'cadence_id' });
      this.hasOne(Lead_Score_Reasons, {
        foreignKey: 'activity_id',
        sourceKey: 'activity_id',
      });
      this.hasOne(Email, { foreignKey: 'message_id', sourceKey: 'message_id' });
      this.hasOne(Message, { foreignKey: 'sms_id', sourceKey: 'sms_id' });
      this.belongsTo(Node, { foreignKey: 'node_id', sourceKey: 'node_id' });
      this.belongsTo(User, { foreignKey: 'user_id', sourceKey: 'user_id' });
      this.belongsTo(Task, { foreignKey: 'task_id', sourceKey: 'task_id' });
    }
  }
  Activity.init(
    {
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM,
        values: Object.values(ACTIVITY_TYPE),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      recording: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      voicemail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      to_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      from_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      incoming: {
        // * to check if activity is incoming or outgoing
        // * If true it is incoming else outgoing
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      read: {
        // * to check if activity is read or not
        // * If true it is read else not read
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      ringover_call_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      salesforce_task_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      message_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sms_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sent_message_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gmail_message_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      note_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      cadence_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      node_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      task_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      event_id: {
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
      tableName: 'activity',
      modelName: 'Activity',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Activity;
};
