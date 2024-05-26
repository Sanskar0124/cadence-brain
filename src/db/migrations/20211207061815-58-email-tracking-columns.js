'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // add 2 columns to the email table: status and tracking_status_update_timestamp
    await queryInterface.addColumn('email', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'delivered',
    });
    await queryInterface.addColumn(
      'email',
      'tracking_status_update_timestamp',
      {
        type: Sequelize.DATE,
        allowNull: true,
      }
    );
    return;
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('email', 'status');
    await queryInterface.removeColumn(
      'email',
      'tracking_status_update_timestamp'
    );
    return;
  },
};
