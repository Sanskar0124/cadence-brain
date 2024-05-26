const logger = require('../../../utils/winston');
const client = require('./setup');

const updateBullhornCandidate = async ({ integration_data }) => {
  try {
    integration_data = JSON.stringify(integration_data);

    const data = await client.updateBullhornCandidate({
      integration_data,
    });

    if (!data.success) return [null, data.msg];

    return [data, null];
  } catch (err) {
    logger.error('Error while sending message from gRPC client: ', err);
    console.log('Stack Trace gRPC updateBullhornCandidate.js: ', err);
    return [null, err.message];
  }
};

module.exports = updateBullhornCandidate;
