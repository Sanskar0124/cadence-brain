const logger = require('../../../utils/winston');
const client = require('./setup');

const getCandidate = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.getCandidate({
      integration_type,
      integration_data: JSON.stringify(integration_data),
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error(
      'Error while fetching candidate integration data via grpc: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = getCandidate;
