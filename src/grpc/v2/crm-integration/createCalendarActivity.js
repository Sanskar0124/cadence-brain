const logger = require('../../../utils/winston');
const client = require('./setup');

const createCalendarActivity = async ({
  integration_type,
  integration_data,
}) => {
  try {
    integration_data = JSON.stringify(integration_data);
    let data = await client.createCalendarActivity({
      integration_type,
      integration_data,
    });
    if (!data.success) return [null, data.msg];

    data = JSON.parse(data.data);

    return [data, null];
  } catch (err) {
    logger.error('Error while creating calendar activity via grpc: ', err);
    console.log('Stack trace createCalendarActivity.js: ', err);
    return [null, err.message];
  }
};

module.exports = createCalendarActivity;
