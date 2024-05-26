'use strict';

const { WORKFLOW_DEFAULT_NAMES } = require('../../utils/enums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('workflow', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'default name',
    });

    const workflows = await queryInterface.sequelize.query(
      'SELECT * FROM workflow'
    );
    //console.log(workflows[0]);
    for (const workflow of workflows[0]) {
      const name = WORKFLOW_DEFAULT_NAMES[workflow.trigger];
      await queryInterface.sequelize.query(
        `UPDATE workflow SET name='${name}' WHERE workflow_id=${workflow.workflow_id}`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('workflow', 'name');
  },
};
