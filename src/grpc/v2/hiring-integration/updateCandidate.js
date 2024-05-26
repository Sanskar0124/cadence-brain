const logger = require('../../../utils/winston');
const client = require('./setup');

const updateCandidate = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.updateCandidate({
      integration_type,
      integration_data: JSON.stringify(integration_data),
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error(
      'Error while updating candidate integration data via grpc: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = updateCandidate;
