module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('cadence', 'favorite', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('cadence', 'favorite');
  },
};
