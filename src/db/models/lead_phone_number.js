'use strict';
// Packages
const { Model } = require('sequelize');

// Helpers and Services
const formatPhoneNumber = require('../../helper/phone-number/formatPhoneNumber');

module.exports = (sequelize, Sequelize) => {
  class Lead_phone_number extends Model {
    static associate({ Lead }) {
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
    }
  }
  Lead_phone_number.init(
    {
      lpn_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      formatted_phone_number: {
        type: Sequelize.VIRTUAL,
        get() {
          const [formattedFromPhoneNumber, errForFormattedFromPhoneNumber] =
            formatPhoneNumber(this.phone_number);

          if (errForFormattedFromPhoneNumber) return '';

          return formattedFromPhoneNumber;
        },
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      time: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.timezone
            ? new Date().toLocaleTimeString('en-US', {
                timeZone: this.timezone,
              })
            : '';
        },
        set() {
          throw new Error('Do not try to set the `time` value!');
        },
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'lead_phone_number',
      modelName: 'Lead_phone_number',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Lead_phone_number;
};
