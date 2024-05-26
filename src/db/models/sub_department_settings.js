'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Sub_Department_Settings extends Model {
    static associate({ Sub_Department }) {
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
    }
  }
  Sub_Department_Settings.init(
    {
      sd_settings_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      max_tasks: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      high_priority_split: {
        type: Sequelize.INTEGER,
        defaultValue: 80,
      },
      enable_new_users_lusha: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      enable_new_users_kaspr: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      enable_new_users_hunter: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      enable_new_users_dropcontact: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      enable_new_users_snov: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'sub_department_settings',
      modelName: 'Sub_Department_Settings',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Sub_Department_Settings;
};
