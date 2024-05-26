'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('statistics_store', {
      store_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      timeframe: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      completed_count: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      skipped_count: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      pending_count: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      automated_completed_count: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      active_lead_count: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      cadence_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      user_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      node_type: {
        type: Sequelize.STRING,
        allowNull: false,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('statistics_store');
  },
};
