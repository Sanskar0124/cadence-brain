'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Unsubscribe_Mail_Settings extends Model {
    static associate({ Company, User, Sub_Department }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
    }
  }
  Unsubscribe_Mail_Settings.init(
    {
      unsubscribe_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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
      semi_automatic_unsubscribed_data: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          mail: true,
        }),
      },
      automatic_unsubscribed_data: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: JSON.stringify({
          mail: true,
        }),
      },
    },
    {
      sequelize,
      tableName: 'unsubscribe_mail_settings',
      modelName: 'Unsubscribe_Mail_Settings',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Unsubscribe_Mail_Settings;
};
