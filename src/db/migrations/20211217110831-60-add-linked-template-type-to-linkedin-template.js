'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('linkedin_template', 'type', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'sd_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('linkedin_template', 'type');
  },
};
