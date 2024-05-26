'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('cadence', 'sd_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('cadence', 'sd_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
