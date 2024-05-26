'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('email_settings', [
      {
        email_settings_id: 1,
        company_id: '4192bff0-e1e0-43ce-a4db-912808c32493',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('email_settings', null, {});
  },
};
