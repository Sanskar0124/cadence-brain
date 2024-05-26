// Utils
const logger = require('../../../../utils/winston');
const convertEventsToGoogleFormat = require('../../utils/convertEventsToGoogleFormat');

// Packages
const axios = require('axios');

// Others
const { getActiveAccessToken } = require('../../oauthClient');

const getMultiple = async ({ outlookRefreshToken, timeZone }) => {
  try {
    const [access_token, tokenErr] = await getActiveAccessToken(
      outlookRefreshToken
    );
    if (tokenErr) {
      logger.error(`Error in outlook retrieving access token`);
      return [null, tokenErr];
    }

    const URL = `https://graph.microsoft.com/v1.0/me/events?$select=body,end,start,onlineMeetingUrl,createdDateTime,subject,attendees,location,singleValueExtendedProperties`;
    const response = await axios.get(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
        Prefer: `outlook.timezone="${timeZone}"`,
      },
    });

    const [events, eventsErr] = convertEventsToGoogleFormat(
      response.data.value
    );
    if (eventsErr) return [null, eventsErr];

    return [events, null];
  } catch (err) {
    logger.error(
      `Error in fetching outlook calendar event`,
      err.response?.data?.error
    );
    return [null, err.response?.data?.error.message ?? err.message];
  }
};

const getMultipleTimeframe = async ({
  outlookRefreshToken,
  timeMin,
  timeMax,
  timeZone,
}) => {
  try {
    const [access_token, tokenErr] = await getActiveAccessToken(
      outlookRefreshToken
    );
    if (tokenErr) {
      logger.error(`Error in outlook retrieving access token`);
      return [null, tokenErr];
    }

    const URL = `https://graph.microsoft.com/v1.0/me/calendarview?startdatetime=${timeMin}&enddatetime=${timeMax}&$select=body,end,start,onlineMeetingUrl,createdDateTime,subject,attendees,location,singleValueExtendedProperties`;

    const response = await axios.get(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
        Prefer: `outlook.timezone="${timeZone}"`,
      },
    });

    const [events, eventsErr] = convertEventsToGoogleFormat(
      response.data.value
    );
    if (eventsErr) return [null, eventsErr];

    return [events, null];
  } catch (err) {
    logger.error(
      `Error in fetching outlook calendar event`,
      err.response?.data?.error
    );
    return [null, err.response?.data?.error.message ?? err.message];
  }
};

const getSingle = async ({ outlookRefreshToken, eventId }) => {
  try {
    const [access_token, tokenErr] = await getActiveAccessToken(
      outlookRefreshToken
    );
    if (tokenErr) {
      logger.error(`Error in outlook retrieving access token`);
      return [null, tokenErr];
    }

    const URL = `https://graph.microsoft.com/v1.0/me/events/${eventId}?$select=body,end,start,onlineMeetingUrl,createdDateTime,subject,attendees,location,singleValueExtendedProperties`;
    const response = await axios.get(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    const [singleEvent, singleEventErr] = convertEventsToGoogleFormat(
      response.data
    );
    if (singleEventErr) return [null, singleEventErr];

    return [singleEvent, null];
  } catch (err) {
    logger.error(
      `Error in fetching outlook calendar event with id ${eventId}`,
      err.response?.data?.error
    );
    return [null, err.response?.data?.error.message ?? err.message];
  }
};

const create = async ({ outlookRefreshToken, requestBody }) => {
  try {
    const [access_token, tokenErr] = await getActiveAccessToken(
      outlookRefreshToken
    );
    if (tokenErr) {
      logger.error(`Error in retrieving outlook access token`);
      return [null, tokenErr];
    }

    const URL = `https://graph.microsoft.com/v1.0/me/events`;
    const response = await axios.post(URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    const createdEventData = response.data;
    return [createdEventData, null];
  } catch (err) {
    logger.error(
      `Error in creating outlook calendar event`,
      err.response?.data?.error
    );
    return [null, err.response?.data?.error.message ?? err.message];
  }
};

const update = async ({ outlookRefreshToken, requestBody }) => {
  try {
    const [access_token, tokenErr] = await getActiveAccessToken(
      outlookRefreshToken
    );
    if (tokenErr) {
      logger.error(`Error in retrieving outlook access token`);
      return [null, tokenErr];
    }

    const URL = `https://graph.microsoft.com/v1.0/me/events/${requestBody.eventId}`;
    delete requestBody.eventId;
    const response = await axios.patch(URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    const updatedEventData = response.data;
    return [updatedEventData, null];
  } catch (err) {
    logger.error(
      `Error in creating outlook calendar event`,
      err.response?.data?.error
    );
    return [null, err.response?.data?.error.message ?? err.message];
  }
};

const deleteEvent = async ({
  outlookRefreshToken,
  eventId
}) => {
  try {
    const [access_token, tokenErr] = await getActiveAccessToken(
      outlookRefreshToken
    );
    if (tokenErr) {
      logger.error(`Error in retrieving outlook access token`);
      return [null, tokenErr];
    }
    const URL = `https://graph.microsoft.com/v1.0/me/events/${eventId}`;
    const response = await axios.delete(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const deletedEventData = response.data;
    return [deletedEventData, null];
  }
  catch (err) {
    logger.error(
      `Error in deleting outlook calendar event`,
      err.response?.data?.error
    );
    return [null, err.response?.data?.error.message ?? err.message];
  }
};

const Events = {
  getMultiple,
  getMultipleTimeframe,
  getSingle,
  create,
  update,
  deleteEvent,
};

module.exports = Events;
