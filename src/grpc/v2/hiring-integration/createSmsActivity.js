const logger = require('../../../utils/winston');
const client = require('./setup');

const createSmsActivity = async ({ integration_type, integration_data }) => {
  try {
    console.log(integration_data);
    integration_data = JSON.stringify(integration_data);
    let data = await client.createSmsActivity({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while creating sms activity via grpc: ', err);
    return [null, err.message];
  }
};

module.exports = createSmsActivity;
