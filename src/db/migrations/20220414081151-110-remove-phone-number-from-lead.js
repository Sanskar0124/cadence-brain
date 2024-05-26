'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('lead', 'phone_number');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lead', 'phone_number', {
      type: Sequelize.STRING(768), // * since 768 is longest length available for an unique field
      allowNull: false,
      unique: true,
    });
  },
};
