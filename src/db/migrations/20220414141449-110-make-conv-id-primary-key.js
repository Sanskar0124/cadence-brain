'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('new_conversation', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      from_phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      conv_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.sequelize.query(
      `INSERT INTO new_conversation SELECT * FROM conversation;`
    );

    await queryInterface.dropTable('conversation');

    await queryInterface.sequelize.query(
      `RENAME TABLE new_conversation TO conversation;`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('new_conversation', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      from_phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      conv_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.sequelize.query(
      `INSERT INTO new_conversation SELECT * FROM conversation;`
    );

    await queryInterface.dropTable('conversation');

    await queryInterface.sequelize.query(
      `RENAME TABLE new_conversation TO conversation;`
    );
  },
};
