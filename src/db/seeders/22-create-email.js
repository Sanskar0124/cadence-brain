'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('email', [
      {
        user_id: 9,
        lead_id: 1,
        // email_json: `{"id":"17ccbb222b2d28dc","threadId":"17ccbb222b2d28dc","labelIds":["SENT"],"snippet":"Hello Test CRM This is my signature","historyId":"57230","internalDate":1635505021000,"headers":{"received":"from 927318954624 named unknown by gmailapi.google.com with HTTPREST; Fri, 29 Oct 2021 06:57:01 -0400","content-type":"text/html","from":"Yuvraj <iamyuvi2000.dev@gmail.com>","to":"Test CRM Account <ziifam786@gmail.com>","reply-to":"Yuvraj <iamyuvi2000.dev@gmail.com>","subject":"Test","message-id":"<CAAnefmedcFeeiZmiTBAHA2eOSAUUZVJcw=GeuvB=jLWhVa+9qw@mail.gmail.com>","content-transfer-encoding":"quoted-printable","date":"Fri, 29 Oct 2021 06:57:01 -0400","mime-version":"1.0"},"textHtml":"hi"}`,
        sent: 1,
        message_id: '17ccbb222b2d28dc',
        thread_id: '17ccbb222b2d28dc',
        status: 'delivered',
        tracking_status_update_timestamp: null,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('email', null, {});
  },
};
