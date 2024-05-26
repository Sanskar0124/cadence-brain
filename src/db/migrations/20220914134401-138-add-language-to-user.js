'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('user', 'language', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'english',
      after: 'timezone',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('user', 'language');
  },
};
