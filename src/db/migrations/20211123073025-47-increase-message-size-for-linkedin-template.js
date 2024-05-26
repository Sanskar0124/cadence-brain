'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('linkedin_template', 'message', {
      type: Sequelize.STRING(16383),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('linkedin_template', 'message', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
