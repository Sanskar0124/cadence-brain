'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `update email set node_id=NULL where node_id='undefined' OR node_id='null'`
    );

    await queryInterface.addColumn('email', 'new_node_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'cadence_id',
    });

    await queryInterface.sequelize.query(
      `update email set new_node_id=node_id`
    );

    await queryInterface.removeColumn('email', 'node_id');

    await queryInterface.renameColumn('email', 'new_node_id', 'node_id');

    //return await queryInterface.changeColumn('email', 'node_id', {
    //type: Sequelize.INTEGER,
    //allowNull: true,
    //after: 'cadence_id',
    //});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `update email set node_id='undefined' where node_id=NULL`
    );

    return await queryInterface.changeColumn('email', 'node_id', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'cadence_id',
    });
  },
};
