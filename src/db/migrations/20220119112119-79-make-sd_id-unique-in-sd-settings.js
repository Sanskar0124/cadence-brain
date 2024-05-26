'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addConstraint('sub_department_settings', {
      type: 'unique',
      name: 'sd_id',
      fields: ['sd_id'],
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeConstraint(
      'sub_department_settings',
      'sd_id',
      {
        type: 'unique',
        name: 'sd_id',
      }
    );
  },
};
