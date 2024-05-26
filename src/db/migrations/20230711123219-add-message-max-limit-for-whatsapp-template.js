'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('whatsapp_template', 'message', {
      type: Sequelize.STRING(500),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('whatsapp_template', 'message', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
