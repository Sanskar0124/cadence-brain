//Utils
const {
  SLACK_CHATBOT_TOKEN,
  SLACK_CHATBOT_CHANNEL,
  SLACK_USER_TOKEN,
} = require('../../utils/config');
const logger = require('../../utils/winston');
const { CHATBOT_TOKEN_TYPES } = require('../../utils/enums');

//Packages
const axios = require('axios');

const sendSlackMessage = async ({
  text,
  channel = SLACK_CHATBOT_CHANNEL,
  thread_id,
  tokenType,
}) => {
  try {
    let message = {
      channel,
      [Object.keys(text)[0]]: Object.values(text)[0],
      thread_ts: thread_id,
    };
    const url = 'https://slack.com/api/chat.postMessage';
    const res = await axios.post(url, JSON.stringify(message), {
      headers: {
        authorization: `Bearer ${
          tokenType === CHATBOT_TOKEN_TYPES.USER
            ? SLACK_USER_TOKEN
            : SLACK_CHATBOT_TOKEN
        }`,
        'content-type': 'application/json',
      },
    });
    return [res, null];
  } catch (err) {
    logger.error('Error while sending slack message: ', err);
    return [null, err.message];
  }
};

module.exports = sendSlackMessage;
