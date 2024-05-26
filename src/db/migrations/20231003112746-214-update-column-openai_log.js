'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('openai_log', 'prompt', {
      type: Sequelize.STRING(10000),
      allowNull: false,
    });
    await queryInterface.changeColumn('openai_log', 'response', {
      type: Sequelize.STRING(10000),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('openai_log', 'prompt', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('openai_log', 'response', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
