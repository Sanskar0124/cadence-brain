'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('note', 'note', {
      type: Sequelize.STRING(16383),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('note', 'note', {
      type: Sequelize.STRING(1000),
      allowNull: false,
    });
  },
};
