'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class User_Task extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  User_Task.init(
    {
      user_task_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // * keeping a default value of 25%
      calls_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      mails_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      messages_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      linkedins_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      data_checks_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      cadence_customs_per_day: {
        // will be stored as percentage
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      automated_messages_sent_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      automated_mails_sent_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      tasks_to_be_added_per_day: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      lusha_calls_per_month: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      kaspr_calls_per_month: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      hunter_calls_per_month: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      dropcontact_calls_per_month: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      snov_calls_per_month: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'user_task',
      modelName: 'User_Task',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return User_Task;
};
