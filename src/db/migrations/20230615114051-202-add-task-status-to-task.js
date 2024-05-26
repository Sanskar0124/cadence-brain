'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('task', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'incomplete',
    });

    await queryInterface.sequelize.query(
      `
      UPDATE task
      SET status = CASE
        WHEN completed = 1 AND is_skipped = 0 THEN 'completed'
        WHEN completed = 0 AND is_skipped = 1 THEN 'skipped'
        ELSE 'incomplete'
      END;
      `
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('task', 'status');
  },
};
