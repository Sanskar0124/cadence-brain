'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.createTable('company_settings', {
      company_settings_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      change_contact_owners_when_account_change: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      change_account_and_contact_when_contact_change: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.dropTable('company_settings');
  },
};
