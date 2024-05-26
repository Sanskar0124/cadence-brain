'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // add column is_profile_picture_present to user table
    await queryInterface.addColumn('user', 'is_profile_picture_present', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // remove column is_profile_picture_present from user table
    await queryInterface.removeColumn('user', 'is_profile_picture_present');
  },
};
