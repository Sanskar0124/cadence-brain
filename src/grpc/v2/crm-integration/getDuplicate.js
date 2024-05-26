const logger = require('../../../utils/winston');
const client = require('./setup');

const getDuplicate = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.getDuplicate({
      integration_type,
      integration_data: JSON.stringify(integration_data),
    });
    if (!data.success) return [null, data.msg];

    if (data.msg === 'No duplicates found.')
      return [null, 'Duplicates not found.'];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while fetching duplicate data via grpc: ', err);
    console.log('Stack trace getDuplicate.js: ', err);
    return [null, err.message];
  }
};

module.exports = getDuplicate;
