'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'custom_domain',
      'createdAt',
      'created_at'
    );

    await queryInterface.renameColumn(
      'custom_domain',
      'updatedAt',
      'updated_at'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'custom_domain',
      'created_at',
      'createdAt'
    );

    await queryInterface.renameColumn(
      'custom_domain',
      'updated_at',
      'updatedAt'
    );
  },
};
