'use strict';

const { LEAD_STATUS } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lead', {
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM,
        values: Object.values(LEAD_STATUS),
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING(768), // * since 768 is longest length available for an unique field
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email_validity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      linkedin_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      source_site: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      duplicate: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      first_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesforce: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      first_contact_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      avg_time_till_first_call: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      assigned_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      salesforce_lead_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesforce_contact_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      list_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ringover_message_conv_id: {
        allowNull: true,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('lead');
  },
};
