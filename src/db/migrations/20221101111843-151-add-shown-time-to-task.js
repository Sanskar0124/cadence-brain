'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // add 'shown_time' column to 'task' table
    await queryInterface.addColumn('task', 'shown_time', {
      type: Sequelize.BIGINT,
      allownull: false,
      defaultValue: null,
      after: 'start_time',
    });
    // update all tasks set shown_time same as start_time
    return await queryInterface.sequelize.query(
      `UPDATE task set shown_time=start_time;`
    );
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('task', 'shown_time');
  },
};
