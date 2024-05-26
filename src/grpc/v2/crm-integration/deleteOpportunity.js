const logger = require('../../../utils/winston');
const client = require('./setup');

const deleteOpportunity = async ({ integration_type, integration_data }) => {
  try {
    integration_data = JSON.stringify(integration_data);
    let data = await client.deleteOpportunity({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);
    console.log('14', data);
    return [data, null];
  } catch (err) {
    logger.error('Error while deleting opportunity via grpc: ', err);
    console.log('Stack Trace create deleteOpportunity.js: ', err);
    return [null, err.message];
  }
};

module.exports = deleteOpportunity;
