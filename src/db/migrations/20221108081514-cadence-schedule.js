'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cadence_schedule', {
      cadence_schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      launch_at: {
        type: Sequelize.STRING,
        allowNull: false,
        autoIncrement: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        unique: true,
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

    await queryInterface.addIndex('cadence_schedule', ['launch_at']);
    await queryInterface.addIndex('cadence_schedule', ['cadence_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('cadence_schedule', ['launch_at']);
    await queryInterface.removeIndex('cadence_schedule', ['cadence_id']);
    await queryInterface.dropTable('cadence_schedule');
  },
};
