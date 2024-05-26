'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('attachment', 'content');
    await queryInterface.removeColumn('attachment', 'content_type');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('attachment', 'content', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('attachment', 'content_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
