const client = require('./setup');
const logger = require('../../../utils/winston');

const updateEvent = async ({
  from_user_id,
  to_user_id,
  startTime,
  endTime,
  conferenceName,
  eventId,
}) => {
  try {
    const data = await client.updateEvent({
      from_user_id,
      to_user_id,
      startTime,
      endTime,
      conferenceName,
      eventId,
    });
    if (!data.success) return [null, data.msg];

    return [data, null];
  } catch (err) {
    logger.error('Error while updating google event via grpc: ', err);
    console.log('Stack trace updateEvent.js: ', err);
    return [null, err.message];
  }
};

module.exports = updateEvent;
