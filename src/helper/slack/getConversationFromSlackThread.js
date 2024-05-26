//Utils
const {
  SLACK_CHATBOT_TOKEN,
  SLACK_CHATBOT_CHANNEL_ID,
} = require('../../utils/config');
const logger = require('../../utils/winston');

//Packages
const axios = require('axios');

const getConversationFromSlackThread = async ({
  channel = SLACK_CHATBOT_CHANNEL_ID,
  thread_id,
}) => {
  try {
    const url = 'https://slack.com/api/conversations.replies';
    const res = await axios.get(url, {
      headers: {
        authorization: `Bearer ${SLACK_CHATBOT_TOKEN}`,
      },
      params: {
        channel: channel,
        ts: thread_id,
        include_all_metadata: true,
      },
    });
    return [res, null];
  } catch (err) {
    logger.error('Error while get conversation from Slack: ', err);
    return [null, err.message];
  }
};

module.exports = getConversationFromSlackThread;
