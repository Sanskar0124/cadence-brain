'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('message_template', 'message', {
      type: Sequelize.STRING(1400),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('message_template', 'message', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
