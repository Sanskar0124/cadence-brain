'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('email', 'cadence_id', 'temp_cadence_id');

    await queryInterface.addColumn('email', 'cadence_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'tracking_image_id',
    });

    await queryInterface.sequelize.query(
      'update email set cadence_id=temp_cadence_id;'
    );

    return await queryInterface.removeColumn('email', 'temp_cadence_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('email', 'cadence_id', 'temp_cadence_id');

    await queryInterface.addColumn('email', 'cadence_id', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'tracking_image_id',
    });

    await queryInterface.sequelize.query(
      'update email set cadence_id=temp_cadence_id;'
    );

    return await queryInterface.removeColumn('email', 'temp_cadence_id');
  },
};
