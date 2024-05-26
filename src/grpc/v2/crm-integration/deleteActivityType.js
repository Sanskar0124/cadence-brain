const logger = require('../../../utils/winston');
const client = require('./setup');

const deleteActivityType = async ({ integration_type, integration_data }) => {
  try {
    integration_data = JSON.stringify(integration_data);
    let data = await client.deleteActivityType({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while deleting activity type via grpc: ', err);
    console.log('Stack trace deleteActivityType.js: ', err);
    return [null, err.message];
  }
};

module.exports = deleteActivityType;
