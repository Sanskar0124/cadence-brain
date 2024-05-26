const logger = require('../../../utils/winston');
const client = require('./setup');

const searchAccount = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.searchAccount({
      integration_type,
      integration_data: JSON.stringify(integration_data),
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while searching accounts data via grpc: ', err);
    console.log('Stack trace searchAccount.js: ', err);
    return [null, err.message];
  }
};

module.exports = searchAccount;
