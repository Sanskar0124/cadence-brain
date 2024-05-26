'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // add column link_text to link_store table
    return await queryInterface.addColumn('link_store', 'link_text', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // remove column link_text from link_store table
    return await queryInterface.removeColumn('link_store', 'link_text');
  },
};
