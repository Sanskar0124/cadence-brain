'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Node', 'is_urgent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'type',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Node', 'is_urgent');
  },
};
