'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('user', 'ringover_user_id', {
      type: Sequelize.BIGINT,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('user', 'ringover_user_id', {
      type: Sequelize.STRING,
    });
  },
};
