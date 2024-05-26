'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(
      'email_settings',
      'wait_time_upper_limit',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 60,
      }
    );

    await queryInterface.changeColumn('email_settings', 'delay', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 30,
    });

    return await queryInterface.changeColumn('email_settings', 'delay', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 60,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(
      'email_settings',
      'wait_time_upper_limit',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 5,
      }
    );

    await queryInterface.changeColumn('email_settings', 'delay', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });

    return await queryInterface.changeColumn('email_settings', 'delay', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
    });
  },
};
