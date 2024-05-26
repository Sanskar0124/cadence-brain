'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Skip_Settings extends Model {
    static associate({ Company, User, Sub_Department }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
    }
  }
  Skip_Settings.init(
    {
      skip_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      skip_allowed_tasks: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          mail: true,
        },
      },
      skip_reasons: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'skip_settings',
      modelName: 'Skip_Settings',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Skip_Settings;
};
