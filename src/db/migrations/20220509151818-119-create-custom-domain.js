'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('custom_domain', {
      cd_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },

      domain_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      domain_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('custom_domain');
  },
};
