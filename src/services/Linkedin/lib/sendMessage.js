// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const sendMessage = async ({ headers, profileId, message }) => {
  try {
    const URL = 'https://www.linkedin.com/voyager/api/messaging/conversations';
    const params = { action: 'create' };
    const msg = Buffer.from(message, 'utf-8');
    const message_event = {
      eventCreate: {
        value: {
          'com.linkedin.voyager.messaging.create.MessageCreate': {
            body: msg.toString('utf-8'),
            attachments: [],
            attributedBody: {
              text: msg.toString('utf-8'),
              attributes: [],
            },
            mediaAttachments: [],
          },
        },
      },
      recipients: [profileId],
      subtype: 'MEMBER_TO_MEMBER',
    };
    const payload = {
      keyVersion: 'LEGACY_INBOX',
      conversationCreate: message_event,
    };

    const res = await axios.post(URL, payload, {
      headers,
      params: params,
    });

    const success = res.status === 201;
    return [success, null];
  } catch (err) {
    if (err?.response?.data)
      logger.error(
        `Error while sending Linkedin message: ${JSON.stringify(
          err?.response?.data
        )}`
      );
    else logger.error('Error while sending Linkedin message: ', err);
    return [null, err.message];
  }
};

module.exports = sendMessage;
