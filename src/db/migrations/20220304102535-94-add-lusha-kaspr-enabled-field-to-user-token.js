'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_token', 'lusha_service_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
    await queryInterface.addColumn('user_token', 'kaspr_service_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_token', 'lusha_service_enabled');
    await queryInterface.removeColumn('user_token', 'kaspr_service_enabled');
  },
};
