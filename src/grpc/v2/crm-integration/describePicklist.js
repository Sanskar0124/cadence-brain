const logger = require('../../../utils/winston');
const client = require('./setup');

const describePicklist = async ({ integration_type, integration_data }) => {
  try {
    let data = await client.describePicklist({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error(
      'Error while fetching picklist values integration data via grpc: ',
      err
    );
    console.log('Stack trace describeObject.js: ', err);
    return [null, err.message];
  }
};

module.exports = describePicklist;
