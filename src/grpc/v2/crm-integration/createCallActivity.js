const logger = require('../../../utils/winston');
const client = require('./setup');

const createCallActivity = async ({ integration_type, integration_data }) => {
  try {
    integration_data = JSON.stringify(integration_data);
    let data = await client.createCallActivity({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while creating call activity via grpc: ', err);
    console.log('Stack Trace createCallActivity.js ', err);
    return [null, err.message];
  }
};

module.exports = createCallActivity;
