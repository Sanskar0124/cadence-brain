'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'lead_phone_number',
      [
        {
          lpn_id: 1,
          lead_id: 1,
          phone_number: '1111111111',
          timezone: 'Asia/Kolkata',
          is_primary: 1,
          type: 'Phone',
        },
        {
          lpn_id: 2,
          lead_id: 2,
          phone_number: '2222222222',
          timezone: 'Asia/Kolkata',
          is_primary: 0,
          type: 'Phone',
        },
        {
          lpn_id: 3,
          lead_id: 3,
          phone_number: '3333333333',
          is_primary: 1,
          timezone: 'Asia/Kolkata',
          type: 'Phone',
        },
        {
          lpn_id: 4,
          lead_id: 4,
          phone_number: '4444444444',
          timezone: 'Asia/Kolkata',
          is_primary: 0,
          type: 'Phone',
        },
        {
          lpn_id: 5,
          lead_id: 5,
          phone_number: '5555555555',
          timezone: 'Asia/Kolkata',
          is_primary: 1,
          type: 'Phone',
        },
        {
          lpn_id: 6,
          lead_id: 6,
          phone_number: '6666666666',
          timezone: 'Asia/Kolkata',
          is_primary: 0,
          type: 'Phone',
        },
        {
          lpn_id: 7,
          lead_id: 7,
          phone_number: '7777777777',
          timezone: 'Asia/Kolkata',
          is_primary: 1,
          type: 'Phone',
        },
        {
          lpn_id: 8,
          lead_id: 8,
          phone_number: '8888888888',
          timezone: 'Asia/Kolkata',
          is_primary: 0,
          type: 'Phone',
        },
        {
          lpn_id: 9,
          lead_id: 10,
          phone_number: '8888888888',
          timezone: 'Asia/Kolkata',
          is_primary: 0,
          type: 'Phone',
        },
        {
          lpn_id: 10,
          lead_id: 11,
          phone_number: '8888888888',
          timezone: 'Asia/Kolkata',
          is_primary: 0,
          type: 'Phone',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lead_phone_number', null, {});
  },
};
