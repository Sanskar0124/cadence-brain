'use strict';

const { NODE_TYPES } = require('../../utils/enums');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task_settings', 'late_settings', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'max_tasks',
      defaultValue: JSON.stringify({
        [NODE_TYPES.CALL]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.MESSAGE]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.MAIL]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.LINKEDIN_MESSAGE]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.LINKEDIN_PROFILE]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.LINKEDIN_INTERACT]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.LINKEDIN_CONNECTION]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.DATA_CHECK]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.CADENCE_CUSTOM]: 1 * 24 * 60 * 60 * 1000,
      }),
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('task_settings', 'late_settings');
  },
};
