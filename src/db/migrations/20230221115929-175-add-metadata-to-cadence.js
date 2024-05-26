'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addColumn('cadence', 'metadata', {
      type: Sequelize.JSON,
      after: 'sd_id',
      defaultValue: {
        deleted_nodes_to_resume: {},
      },
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('cadence', 'metadata');
  },
};
