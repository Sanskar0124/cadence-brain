'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('enrichments', 'lusha_api_limit', {
      type: Sequelize.INTEGER,
      defaultValue: 100,
    });
    await queryInterface.addColumn('enrichments', 'lusha_api_calls', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('enrichments', 'kaspr_api_limit', {
      type: Sequelize.INTEGER,
      defaultValue: 100,
    });
    await queryInterface.addColumn('enrichments', 'kaspr_api_calls', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('enrichments', 'hunter_api_limit', {
      type: Sequelize.INTEGER,
      defaultValue: 100,
    });
    await queryInterface.addColumn('enrichments', 'hunter_api_calls', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('enrichments', 'dropcontact_api_limit', {
      type: Sequelize.INTEGER,
      defaultValue: 100,
    });
    await queryInterface.addColumn('enrichments', 'dropcontact_api_calls', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('enrichments', 'snov_api_limit', {
      type: Sequelize.INTEGER,
      defaultValue: 100,
    });
    await queryInterface.addColumn('enrichments', 'snov_api_calls', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('enrichments', 'lusha_api_limit');
    await queryInterface.removeColumn('enrichments', 'lusha_api_calls');

    await queryInterface.removeColumn('enrichments', 'kaspr_api_limit');
    await queryInterface.removeColumn('enrichments', 'kaspr_api_calls');

    await queryInterface.removeColumn('enrichments', 'hunter_api_limit');
    await queryInterface.removeColumn('enrichments', 'hunter_api_calls');

    await queryInterface.removeColumn('enrichments', 'dropcontact_api_limit');
    await queryInterface.removeColumn('enrichments', 'dropcontact_api_calls');

    await queryInterface.removeColumn('enrichments', 'snov_api_limit');
    await queryInterface.removeColumn('enrichments', 'snov_api_calls');
  },
};
