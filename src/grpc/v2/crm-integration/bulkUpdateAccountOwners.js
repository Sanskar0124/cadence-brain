const logger = require('../../../utils/winston');
const client = require('./setup');

const bulkUpdateAccountOwners = async ({
  integration_type,
  integration_data,
}) => {
  try {
    integration_data = JSON.stringify(integration_data);
    let data = await client.bulkUpdateAccountOwners({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while updating account owner via grpc: ', err);
    return [null, err.message];
  }
};

module.exports = bulkUpdateAccountOwners;
