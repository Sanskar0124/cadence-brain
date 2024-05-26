'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('link_store', 'sms_id', {
      type: Sequelize.STRING,
      defaultValue: 'NONE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('link_store', 'sms_id');
    return;
  },
};
