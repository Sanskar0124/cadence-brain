const logger = require('../../../utils/winston');
const client = require('./setup');

const getRelatedLead = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.getRelatedLead({
      integration_type,
      integration_data: JSON.stringify(integration_data),
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while fetching related data via grpc: ', err);
    console.log('Stack trace getRelatedLead.js: ', err);
    return [null, err.message];
  }
};

module.exports = getRelatedLead;
