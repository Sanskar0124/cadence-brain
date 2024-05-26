'use strict';

// Utils
const { TRACKING_IMAGE_URL } = require('../../utils/config');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Email extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method a'utomatically.
     */
    static associate({
      User,
      Lead,
      Activity,
      LinkStore,
      Cadence,
      Email_Template,
      Node,
      Video_Tracking,
    }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
      this.belongsTo(Cadence, { foreignKey: 'cadence_id' });
      this.belongsTo(Activity, {
        foreignKey: 'message_id',
        sourceKey: 'message_id',
      });
      this.hasMany(LinkStore, { foreignKey: 'message_id' });
      this.belongsTo(Email_Template, { foreignKey: 'et_id' });
      this.belongsTo(Node, { foreignKey: 'node_id' });
      this.hasMany(Video_Tracking, { foreignKey: 'message_id' });
    }
  }
  Email.init(
    {
      user_id: Sequelize.UUID,
      lead_id: Sequelize.INTEGER,
      sent: Sequelize.BOOLEAN,
      et_id: Sequelize.INTEGER,
      message_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      thread_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        // [delivered, opened, clicked, bounced]
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'delivered',
      },
      tracking_status_update_timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
        default: new Date(),
      },
      tracking_image_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tracking_image_url: {
        type: Sequelize.VIRTUAL,
        get() {
          // hardcoding for now
          return `${TRACKING_IMAGE_URL + this.message_id}`;
        },
        set(value) {
          throw error(
            "Do not set a value for tracking_image_url, it's auto generated"
          );
        },
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      node_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      open_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      unsubscribed: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_replied_mail: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'Email',
      tableName: 'email',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Email;
};
