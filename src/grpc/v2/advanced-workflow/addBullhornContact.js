const logger = require('../../../utils/winston');
const client = require('./setup');

const addBullhornContact = async ({ integration_data }) => {
  try {
    integration_data = JSON.stringify(integration_data);

    const data = await client.addBullhornContact({
      integration_data,
    });

    if (!data.success) return [null, data.msg];

    return [data, null];
  } catch (err) {
    logger.error('Error while sending message from gRPC client: ', err);
    console.log('Stack Trace gRPC addBullhornContact.js: ', err);
    return [null, err.message];
  }
};

module.exports = addBullhornContact;
