'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Video_Template extends Model {
    static associate({ User, Sub_Department, Company, Video, Video_Tracking }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.belongsTo(Video, { foreignKey: 'video_id' });
      this.hasMany(Video_Tracking, { foreignKey: 'vt_id' });
    }
  }
  Video_Template.init(
    {
      vt_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      video_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      level: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'video_template',
      modelName: 'Video_Template',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Video_Template;
};
