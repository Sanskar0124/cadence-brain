const logger = require('../../../utils/winston');
const client = require('./setup');

const getUser = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.getUser({
      integration_type,
      integration_data: JSON.stringify(integration_data),
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while fetching user integration data via grpc: ', err);
    console.log('Stack trace getUser.js: ', err);
    return [null, err.message];
  }
};

module.exports = getUser;
