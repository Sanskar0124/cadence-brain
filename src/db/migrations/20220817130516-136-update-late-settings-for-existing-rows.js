'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(
      `update task_settings set late_settings='{"call":86400000,"message":86400000,"mail":86400000,"linkedin_message":86400000,"linkedin_profile":86400000,"linkedin_interact":86400000,"linkedin_connection":86400000,"data_check":86400000,"cadence_custom":86400000}'`
    );
  },

  async down(queryInterface, Sequelize) {},
};
