'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('zoho_tokens', 'data_center', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'rest of the world',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('zoho_tokens', 'data_center', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
