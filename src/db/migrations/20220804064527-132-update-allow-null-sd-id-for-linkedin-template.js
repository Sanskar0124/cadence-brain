'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('linkedin_template', 'sd_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('linkedin_template', 'sd_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
