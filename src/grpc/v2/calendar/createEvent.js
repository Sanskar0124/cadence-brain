const client = require('./setup');
const logger = require('../../../utils/winston');

const createEvent = async ({
  integrationType,
  user_id,
  lead_id,
  startTime,
  endTime,
  conferenceName,
  meetType,
  ringoverMeetLink,
  eventDescription,
  addAttendees,
}) => {
  try {
    const data = await client.createEvent({
      integrationType,
      user_id,
      lead_id,
      startTime,
      endTime,
      conferenceName,
      meetType,
      ringoverMeetLink,
      eventDescription,
      addAttendees,
    });
    if (!data.success) return [null, data.msg];

    return [data, null];
  } catch (err) {
    logger.error('Error while creating google event via grpc: ', err);
    console.log('Stack trace createEvent.js: ', err);
    return [null, err.message];
  }
};

module.exports = createEvent;
