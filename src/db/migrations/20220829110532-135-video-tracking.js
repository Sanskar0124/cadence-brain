'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('video_tracking', {
      video_tracking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      video_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      vt_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_visited: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      message_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      watch_duration: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      lead_cadence_id: {
        type: Sequelize.UUID,
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
    await queryInterface.dropTable('video_tracking');
  },
};
