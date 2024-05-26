const logger = require('../../../utils/winston');
const client = require('./setup');

const describeObject = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.describeObject({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error(
      'Error while fetching describe field integration data via grpc: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = describeObject;
