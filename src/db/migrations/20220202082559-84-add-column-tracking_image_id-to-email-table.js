'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // add column tracking_image_id to email table
    return await queryInterface.addColumn('email', 'tracking_image_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // remove column tracking_image_id from email table
    return await queryInterface.removeColumn('email', 'tracking_image_id');
  },
};
