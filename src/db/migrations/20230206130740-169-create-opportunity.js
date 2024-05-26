'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('opportunity', {
      opportunity_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Opportunity must have a name' },
          notEmpty: { msg: 'Opportunity name must not be empty' },
        },
      },
      integration_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      integration_account_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_owner_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      integration_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      integration_stage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      close_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      probability: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'open',
        allowNull: true,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('opportunity');
  },
};
