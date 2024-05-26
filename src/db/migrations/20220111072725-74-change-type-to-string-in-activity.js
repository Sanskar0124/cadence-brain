'use strict';

const { ACTIVITY_TYPE } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('activity', 'type', 'temp_type');

    await queryInterface.addColumn('activity', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'name',
    });

    await queryInterface.sequelize.query('update activity set type=temp_type;');

    return await queryInterface.removeColumn('activity', 'temp_type');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('activity', 'type', 'temp_type');

    await queryInterface.addColumn('activity', 'type', {
      type: Sequelize.ENUM,
      values: Object.values(ACTIVITY_TYPE),
      allowNull: false,
    });

    await queryInterface.sequelize.query('update activity set type=temp_type;');

    return await queryInterface.removeColumn('activity', 'temp_type');
  },
};
