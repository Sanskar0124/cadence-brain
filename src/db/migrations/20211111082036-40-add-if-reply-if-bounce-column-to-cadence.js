'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('cadence', 'remove_if_reply', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
    return await queryInterface.addColumn('cadence', 'remove_if_bounce', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('cadence', 'remove_if_reply');
    return await queryInterface.removeColumn('cadence', 'remove_if_bounce');
  },
};
