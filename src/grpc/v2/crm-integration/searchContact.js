const logger = require('../../../utils/winston');
const client = require('./setup');

const searchContact = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.searchContact({
      integration_type,
      integration_data: JSON.stringify(integration_data),
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while searching contacts data via grpc: ', err);
    console.log('Stack trace searchContact.js: ', err);
    return [null, err.message];
  }
};

module.exports = searchContact;
