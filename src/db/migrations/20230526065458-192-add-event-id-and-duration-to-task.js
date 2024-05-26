'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task', 'event_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('task', 'duration', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('task', 'event_id');
    await queryInterface.removeColumn('task', 'duration');
  },
};
