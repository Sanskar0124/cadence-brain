'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('account', 'new_size', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query('UPDATE account SET new_size=size;');

    await queryInterface.removeColumn('account', 'size');

    await queryInterface.renameColumn('account', 'new_size', 'size');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('account', 'size', 'new_size');

    await queryInterface.addColumn('account', 'size', {
      type: Sequelize.ENUM,
      values: Object.values(ACCOUNT_SIZE),
      allowNull: false,
    });

    await queryInterface.sequelize.query('UPDATE account SET size=new_size;');

    await queryInterface.removeColumn('account', 'new_size');
  },
};
