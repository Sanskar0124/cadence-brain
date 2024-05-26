'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Video_Tracking extends Model {
    static associate({ Video, LeadToCadence, Email, Video_Template }) {
      this.belongsTo(Video, { foreignKey: 'video_id' });
      this.belongsTo(LeadToCadence, { foreignKey: 'lead_cadence_id' });
      this.belongsTo(Email, { foreignKey: 'message_id' });
      this.belongsTo(Video_Template, { foreignKey: 'vt_id' });
    }
  }
  Video_Tracking.init(
    {
      video_tracking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      video_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      vt_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_visited: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      message_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      watch_duration: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      lead_cadence_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Video_Tracking',
      tableName: 'video_tracking',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Video_Tracking;
};
