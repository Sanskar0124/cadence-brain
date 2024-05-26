'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.changeColumn('lead', 'last_name', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '',
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.changeColumn('lead', 'last_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
