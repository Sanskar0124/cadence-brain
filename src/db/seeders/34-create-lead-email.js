'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'lead_email',
      [
        {
          lem_id: 1,
          lead_id: 1,
          email_id: 'iamyuvi2000@gmail.com',
          is_primary: 1,
          type: 'Email',
        },
        {
          lem_id: 2,
          lead_id: 2,
          email_id: 'iamyuvi2000+1@gmail.com',
          is_primary: 0,
          type: 'Email',
        },
        {
          lem_id: 3,
          lead_id: 3,
          email_id: 'bdnyaneshwar89@gmail.com',
          is_primary: 1,
          type: 'Email',
        },
        {
          lem_id: 4,
          lead_id: 4,
          email_id: 'bdnyaneshwar89+1@gmail.com',
          is_primary: 0,
          type: 'Email',
        },
        {
          lem_id: 5,
          lead_id: 5,
          email_id: 'dasatmadeep@gmail.com',
          is_primary: 1,
          type: 'Email',
        },
        {
          lem_id: 6,
          lead_id: 6,
          email_id: 'dasatmadeep+1@gmail.com',
          is_primary: 0,
          type: 'Email',
        },
        {
          lem_id: 7,
          lead_id: 7,
          email_id: 'ziyankarmali786@gmail.com',
          is_primary: 1,
          type: 'Email',
        },
        {
          lem_id: 8,
          lead_id: 8,
          email_id: 'ziyankarmali786+1@gmail.com',
          is_primary: 0,
          type: 'Email',
        },
        {
          lem_id: 9,
          lead_id: 9,
          email_id: 'shivansh.verma+123@bjtmail.com',
          is_primary: 1,
          type: 'Email',
        },
        {
          lem_id: 10,
          lead_id: 10,
          email_id: 'subhranshu_dash@bjtmail.com',
          is_primary: 1,
          type: 'Email',
        },
        {
          lem_id: 11,
          lead_id: 11,
          email_id: 'subhranshu_dash+01@bjtmail.com',
          is_primary: 1,
          type: 'Email',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lead_email', null, {});
  },
};
