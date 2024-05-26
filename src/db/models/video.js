'use strict';

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Video extends Model {
    static associate({ User, Video_Tracking, Video_Template }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.hasOne(Video_Template, { foreignKey: 'video_id' });
      this.hasOne(Video_Tracking, { foreignKey: 'video_id' });
    }
  }
  Video.init(
    {
      video_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: Sequelize.UUID,
      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      video_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return `https://storage.googleapis.com/apt-cubist-307713.appspot.com/crm/videos/${this.file_name}?video_id=${this.video_id}`;
        },
        set(value) {
          throw new Error('Do not try to set the `video` value!');
        },
      },
      thumbnail_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return `https://storage.googleapis.com/apt-cubist-307713.appspot.com/crm/thumbnails/${this.file_name}`;
        },
        set(value) {
          throw new Error('Do not try to set the `thumbnail` value!');
        },
      },
      is_thumbnail_present: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      video_duration: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Video',
      tableName: 'video',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Video;
};
