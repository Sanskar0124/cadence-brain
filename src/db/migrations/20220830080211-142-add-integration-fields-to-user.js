'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'integration_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('user', 'integration_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      'update user set integration_id=salesforce_owner_id;'
    );
    await queryInterface.sequelize.query(
      'update user set integration_type="salesforce_owner";'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'integration_type');
    await queryInterface.removeColumn('user', 'integration_id');
  },
};
