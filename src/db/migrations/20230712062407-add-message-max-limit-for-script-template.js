'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('script_template', 'script', {
      type: Sequelize.STRING(15000),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('script_template', 'script', {
      type: Sequelize.STRING(16383),
      allowNull: false,
    });
  },
};
