'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Bounced_Mail_Settings extends Model {
    static associate({ Company, User, Sub_Department, Settings }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
      this.belongsTo(Settings, {
        foreignKey: 'bounced_settings_id',
        targetKey: 'bounced_settings_id',
      });
    }
  }
  Bounced_Mail_Settings.init(
    {
      bounced_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      semi_automatic_bounced_data: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          mail: true,
        }),
      },
      automatic_bounced_data: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          mail: true,
        }),
      },
      company_id: {
        type: Sequelize.UUID,
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
      tableName: 'bounced_mail_settings',
      modelName: 'Bounced_Mail_Settings',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Bounced_Mail_Settings;
};
