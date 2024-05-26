const logger = require('../../../utils/winston');
const client = require('./setup');

const createDeadlineActivity = async ({
  integration_type,
  integration_data,
}) => {
  try {
    integration_data = JSON.stringify(integration_data);
    let data = await client.createDeadlineActivity({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while creating deadline activity via grpc: ', err);
    console.log('Stack trace createDeadlineActivity.js: ', err);
    return [null, err.message];
  }
};

module.exports = createDeadlineActivity;
