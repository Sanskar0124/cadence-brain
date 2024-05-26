'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // add column is_profile_picture_present to sub_department table
    return await queryInterface.addColumn(
      'sub_department',
      'is_profile_picture_present',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // remove column is_profile_picture_present from sub_department table
    return await queryInterface.removeColumn(
      'sub_department',
      'is_profile_picture_present'
    );
  },
};
