'use strict';

const { USER_ROLE } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('user', 'role', 'temp_role');

    await queryInterface.addColumn('user', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'password',
    });

    await queryInterface.sequelize.query('update user set role=temp_role;');

    return await queryInterface.removeColumn('user', 'temp_role');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('user', 'role', 'temp_role');

    await queryInterface.addColumn('user', 'role', {
      type: Sequelize.ENUM,
      values: Object.values(USER_ROLE),
      allowNull: false,
    });

    await queryInterface.sequelize.query('update user set role=temp_role;');

    return await queryInterface.removeColumn('user', 'temp_role');
  },
};
