const logger = require('../../../utils/winston');
const client = require('./setup');

const sendMessage = async ({ integration_type, message_data }) => {
  try {
    message_data = JSON.stringify(message_data);

    const data = await client.sendMessage({
      integration_type,
      message_data,
    });

    if (!data.success) return [null, data.msg];

    return [data, null];
  } catch (err) {
    logger.error('Error while sending message from gRPC client: ', err);
    console.log('Stack trace sendMessage.js: ', err);
    return [null, err.message];
  }
};

module.exports = sendMessage;
