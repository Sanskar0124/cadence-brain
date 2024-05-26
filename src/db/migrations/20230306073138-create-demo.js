'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'demo',
      {
        demo_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        lead_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        lem_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        cadence_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        node_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        meeting_url: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        integration_id: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: true,
        },
        schedule_time: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        timezone: {
          type: Sequelize.STRING,
          allowNull: true,
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
      },
      {
        timestamps: true,
        tableName: 'demo',
        modelName: 'Demo',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('demo');
  },
};
