'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('activity', 'incoming', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      after: 'voicemail',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('activity', 'incoming');
  },
};
