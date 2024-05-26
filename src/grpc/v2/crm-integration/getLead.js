const logger = require('../../../utils/winston');
const client = require('./setup');

const getLead = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.getLead({
      integration_type,
      integration_data: JSON.stringify(integration_data),
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while fetching lead integration data via grpc: ', err);
    console.log('Stack Trace getLead.js: ', err);
    return [null, err.message];
  }
};

module.exports = getLead;
