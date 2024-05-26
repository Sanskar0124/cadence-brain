'use strict';

//helpers
const { SMS_STATUS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('message', {
      user_id: { type: Sequelize.UUID },
      lead_id: { type: Sequelize.INTEGER },
      sent: { type: Sequelize.BOOLEAN },
      from_phone_number: { type: Sequelize.STRING, allowNull: false },
      to_phone_number: { type: Sequelize.STRING, allowNull: false },
      mt_id: { type: Sequelize.INTEGER },
      sms_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      conv_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      status: {
        // [delivered, opened, clicked, bounced]
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: SMS_STATUS.DELIVERED,
      },
      tracking_status_update_timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
        default: new Date(),
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      node_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      unsubscribed: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('message');
  },
};
