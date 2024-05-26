'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addColumn('cadence', 'resynching', {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      after: 'remove_if_bounce',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('cadence', 'resynching');
  },
};
