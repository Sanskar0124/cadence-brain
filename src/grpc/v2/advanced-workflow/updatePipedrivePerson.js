const logger = require('../../../utils/winston');
const client = require('./setup');

const updatePipedrivePerson = async ({ integration_data }) => {
  try {
    integration_data = JSON.stringify(integration_data);

    const data = await client.updatePipedrivePerson({
      integration_data,
    });

    if (!data.success) return [null, data.msg];

    return [data, null];
  } catch (err) {
    logger.error('Error while sending message from gRPC client: ', err);
    console.log('Stack Trace gRPC updatePipedrivePerson.js: ', err);
    return [null, err.message];
  }
};

module.exports = updatePipedrivePerson;
