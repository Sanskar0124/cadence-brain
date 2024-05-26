'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Automated_Tasks extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  Automated_Tasks.init(
    {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      automated_linkedin_connection_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 20,
      },
      automated_linkedin_message_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 30,
      },
      automated_linkedin_profile_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 30,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'linkedin_automated_task_settings',
      modelName: 'Linkedin_Automated_Task_Settings',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Automated_Tasks;
};
