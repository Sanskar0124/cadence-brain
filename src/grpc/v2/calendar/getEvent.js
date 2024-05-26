const client = require('./setup');
const logger = require('../../../utils/winston');

const getEvent = async ({ eventId, user_id }) => {
  try {
    const data = await client.getEvent({ eventId, user_id });
    if (!data.success) return [null, `${data.msg}: ${data.data}`];
    return [data, null];
  } catch (err) {
    logger.error('Error while fetching event via grpc: ', err);
    console.log('Stack trace getEvent.js: ', err);
    return [null, err.message];
  }
};

module.exports = getEvent;
