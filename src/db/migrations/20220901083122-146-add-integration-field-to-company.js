'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company', 'integration_type', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.sequelize.query(
      'update company set integration_type="salesforce";'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('company', 'integration_type');
  },
};
