'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.renameColumn('tag', 'name', 'tag_name');
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.renameColumn('tag', 'tag_name', 'tag');
  },
};
