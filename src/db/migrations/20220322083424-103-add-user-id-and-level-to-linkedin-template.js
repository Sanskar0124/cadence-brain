'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('linkedin_template', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn('linkedin_template', 'level', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('linkedin_template', 'user_id');
    await queryInterface.removeColumn('linkedin_template', 'level');
  },
};
