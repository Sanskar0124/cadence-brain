const logger = require('../../../utils/winston');
const client = require('./setup');

const updateLead = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.updateLead({
      integration_type,
      integration_data: JSON.stringify(integration_data),
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while updating lead integration data via grpc: ', err);
    return [null, err.message];
  }
};

module.exports = updateLead;
