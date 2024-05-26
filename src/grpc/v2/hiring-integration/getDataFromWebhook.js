const logger = require('../../../utils/winston');
const client = require('./setup');

const getWebhooks = async ({ integration_type, integration_data }) => {
  try {
    integration_data = JSON.stringify(integration_data);
    let data = await client.getDataFromWebhook({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while fetching webhooks via grpc: ', err);
    console.log('Stack Trace getWebhook.js: ', err);
    return [null, err.message];
  }
};

module.exports = getWebhooks;
