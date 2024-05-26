'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // remove email_json column from email table
    await queryInterface.removeColumn('email', 'email_json');
  },

  down: async (queryInterface, Sequelize) => {
    // add email_json column to email table
    await queryInterface.addColumn('email', 'email_json', {
      type: Sequelize.TEXT,
    });
  },
};
