const getInitMessageJSON = async ({
  first_name = '',
  last_name = '',
  email = '',
  issue_id = '',
  company = '',
  timeZone = '',
  role = '',
  user_id,
  subDepartment = '',
  lang = '',
  integration_type,
  mail_integration_type,
}) => {
  const date = new Date();
  let body = {
    attachments: [
      {
        color: '#f2c744',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'New issue reported by ' + first_name + '!',
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Issue ID:* ' + issue_id,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: '*Name:* ' + first_name + ' ' + last_name,
              },
              {
                type: 'mrkdwn',
                text: '*Role:* ' + role,
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: '*Sub department:* ' + subDepartment,
              },
              {
                type: 'mrkdwn',
                text: '*Company:* ' + company,
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: '*Email:* ' + email,
              },
              {
                type: 'mrkdwn',
                text: '*User ID:* ' + user_id,
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text:
                  '*User Date:* ' +
                  date.toLocaleDateString('en-US', { timeZone: timeZone }),
              },
              {
                type: 'mrkdwn',
                text:
                  '*User Time:* ' +
                  date.toLocaleTimeString('en-US', { timeZone: timeZone }),
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: '*Timezone:* ' + timeZone,
              },
              {
                type: 'mrkdwn',
                text: '*Language:* ' + lang,
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: '*Integration Type:* ' + integration_type,
              },
              {
                type: 'mrkdwn',
                text: '*Mail Integration Type:* ' + mail_integration_type,
              },
            ],
          },
          // {
          //   type: 'section',
          //   text:
          //     {
          //       type: 'mrkdwn',
          //       text: '<https://cd.ringover-crm.xyz/|Goto message>',
          //     },
          // },
        ],
      },
    ],
  };
  return body;
};

module.exports = getInitMessageJSON;
