'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.createTable('node', {
      node_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        // * Validate this with enum while creating node
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_first: {
        // * To Fetch first node in order to build sequence of nodes for a cadence
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      next_node_id: {
        type: Sequelize.INTEGER,
        // * For last node it will be null
        allowNull: true,
      },
      data: {
        // * This will hold data for the node
        type: Sequelize.JSON,
        allowNull: false,
      },
      wait_time: {
        /**
         * * This will be stored in minutes,
         * * and will be used to calculate start_time for the task created from this node
         */
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
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

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.dropTable('node');
  },
};
