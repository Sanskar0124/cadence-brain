'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('activity', 'read', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      after: 'incoming',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('activity', 'read');
  },
};
