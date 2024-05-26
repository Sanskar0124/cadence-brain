'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('task', 'list_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });

    return await queryInterface.changeColumn('task', 'node_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('task', 'list_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    return await queryInterface.changeColumn('task', 'node_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
