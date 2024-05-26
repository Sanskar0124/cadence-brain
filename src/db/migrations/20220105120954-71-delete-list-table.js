'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.dropTable('list');
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.createTable('list', {
      list_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        // * Validate this with enum while creating node
        type: Sequelize.STRING,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sd_id: {
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
};
