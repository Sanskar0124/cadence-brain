'use strict';

// Packages
const { Model } = require('sequelize');

//helpers
const { SMS_STATUS } = require('../../utils/enums');

module.exports = (sequelize, Sequelize) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method a'utomatically.
     */
    static associate({
      User,
      Lead,
      LinkStore,
      Cadence,
      Message_Template,
      Node,
      Activity,
    }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
      this.belongsTo(Cadence, { foreignKey: 'cadence_id' });
      this.hasMany(LinkStore, { foreignKey: 'sms_id' });
      this.belongsTo(Message_Template, { foreignKey: 'mt_id' });
      this.belongsTo(Node, { foreignKey: 'node_id' });
      this.belongsTo(Activity, {
        foreignKey: 'sms_id',
        sourceKey: 'sms_id',
      });
    }
  }
  Message.init(
    {
      user_id: Sequelize.UUID,
      lead_id: Sequelize.INTEGER,
      sent: Sequelize.BOOLEAN,
      from_phone_number: { type: Sequelize.STRING, allowNull: false },
      to_phone_number: { type: Sequelize.STRING, allowNull: false },
      mt_id: Sequelize.INTEGER,
      sms_id: {
        // synonymous to message_id received from RingoverService
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      conv_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      status: {
        // [delivered, opened, clicked, bounced]
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: SMS_STATUS.DELIVERED,
      },
      tracking_status_update_timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
        default: new Date(),
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      node_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      unsubscribed: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'Message',
      tableName: 'message',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Message;
};
