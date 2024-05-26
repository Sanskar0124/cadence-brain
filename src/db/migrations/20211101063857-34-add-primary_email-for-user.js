'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('user', 'primary_email', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'email',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('user', 'primary_email');
  },
};
