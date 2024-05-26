'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // create new table: link_store
    return await queryInterface.createTable('link_store', {
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      message_id: {
        type: Sequelize.STRING,
      },
      redirect_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_clicked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      clicked_timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // drop table: link_store
    return await queryInterface.dropTable('link_store');
  },
};
