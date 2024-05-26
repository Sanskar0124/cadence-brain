const axios = require('axios');
const getDurationInMinutes = require('../utils/getDurationInMinutes');
const logger = require('../../../utils/winston');

const createMeetingEvent = async (
  salesforce_lead_id,
  conferenceName,
  startTime,
  endTime,
  access_token,
  instance_url
) => {
  try {
    let body = {
      WhoId: salesforce_lead_id,
      Subject: 'Meeting',
      Description: conferenceName,
      ActivityDate: new Date(startTime),
      ActivityDateTime: new Date(startTime),
      DurationInMinutes: getDurationInMinutes(startTime, endTime),
      StartDateTime: new Date(startTime),
      EndDateTime: new Date(endTime),
    };

    const URL = `${instance_url}/services/data/v52.0/sobjects/Event`;
    const response = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.data.success) {
      logger.info('Salesforce meeting event created successfully');
      console.log(response.data);
      return [true, null];
    }
    logger.info('Salesforce meeting event creation failed');
    console.log(response.data.errors);
    return [false, response.data.errors];
  } catch (err) {
    logger.error(
      `Error while creating meeting event in salesforce: ${err.message}`
    );
    console.log(err.response.data);
    return [null, err.message];
  }
};

module.exports = createMeetingEvent;
