//Utils
const rfc3339 = require('../../utils/rfc3339');
const getTimeDelta = require('../../utils/getTimeDelta');
const logger = require('../../../../utils/winston');
const jwthelper = require('../../utils/jwt');
const config = require('../../../../utils/config');
const { DB_TABLES } = require('../../../../utils/modelEnums');
const moment = require('moment-timezone');
const { MAIL_SCOPE_LEVEL } = require('../../../../utils/enums');

//Packages
const { google } = require('googleapis');
const { nanoid } = require('nanoid');

//Repository
const Repository = require('../../../../repository');

//Helpers and Services
const oauth = require('../../oathClient');
const UserHelper = require('../../../../helper/user');

/**
 * @param {Object} token - Token object for google apis access
 * @param {string} token.refresh_token - Refresh token
 * @param {Array<string>} calendarList - (Optional) Calendar IDs for which event needs to be fetched. If not given, all of user's calendars are used to fetch events
 * @description Get events from multiple calendars
 * */
const getMultiple = async (
  token,
  calendarList = [],
  email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE
) => {
  try {
    const auth = oauth.get(token, email_scope_level);
    const calendar = google.calendar({ version: 'v3', auth });
    if (calendarList.length == 0) {
      const ls = await calendar.calendarList.list({ maxResults: 250 });
      //TODO: Handle Next Page Token when person has more than 250 calendars.
      //      Highly unlikely though
      calendarList = ls.data.items.map((cal) => cal.id);
    }
    const eventsPromiseArray = calendarList.map((calendarId) =>
      //TODO: Handle Next Page Token when person has more than 2500 events.
      //      Highly unlikely though
      calendar.events.list({
        calendarId,
        maxResults: 2500,
        //timeMin: rfc3339.fromDate(), //TODO: Use next page token to fetch all
      })
    );
    const calendars = await Promise.all(eventsPromiseArray);
    return [
      calendars.map((cl, i) => ({
        calendarId: calendarList[i],
        calendarName: cl.data.summary,
        events: cl.data.items,
      })),
      null,
    ];
  } catch (err) {
    logger.error(err);
    return [null, err.response ? err.response.data.error : err.message];
  }
};

/**
 * @param {Object} token - Token object for google apis access
 * @param {string} token.refresh_token - Refresh token
 * @param {string} timeFrame - enum {day, week, month}
 * @param {Date} date - Date around which timedelta will be calculated
 * @param {string} offset - enum {start, pivot, end}
 * @param {String} email_scope_level - Email scope level
 * @param {Array<string>} calendarList - (Optional) Calendar IDs for which event needs to be fetched. If not given, all of user's calendars are used to fetch events
 * @description Get events from multiple calendars in a specific timeframe
 * */
const getMultipleTimeframe = async ({
  token,
  calendarList = [],
  timeFrame,
  date,
  offset,
  email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE,
}) => {
  try {
    const auth = oauth.get(token, email_scope_level);
    const calendar = google.calendar({ version: 'v3', auth });
    if (calendarList.length == 0) {
      const ls = await calendar.calendarList.list({ maxResults: 250 });
      //TODO: Handle Next Page Token when person has more than 250 calendars.
      //      Highly unlikely though
      calendarList = ls.data.items.map((cal) => cal.id);
    }
    const [{ startDate: timeMin, endDate: timeMax }, err] = getTimeDelta({
      timeFrame,
      dateNow: date,
      offset,
    });
    const eventsPromiseArray = calendarList.map((calendarId) =>
      //TODO: Handle Next Page Token when person has more than 2500 events.
      //      Highly unlikely though
      calendar.events.list({
        calendarId,
        maxResults: 2500,
        timeMin,
        timeMax,
        //timeMin: rfc3339.fromDate(), //TODO: Use next page token to fetch all
      })
    );
    const calendars = await Promise.all(eventsPromiseArray);
    return [
      calendars.map((cl, i) => ({
        calendarId: calendarList[i],
        calendarName: cl.data.summary,
        events: cl.data.items,
      })),
      null,
    ];
  } catch (err) {
    logger.error(`Error occurred while getting events by time`, err);
    return [null, err.response ? err.response.data.error : err.message];
  }
};

/**
 * @param {Object} token - Token object for google apis access
 * @param {string} token.refresh_token - Refresh token
 * @param {String} timezone - Timezone
 * @param {String} email_scope_level - Email scope level
 * @description Get events from multiple calendars in a specific timeframe for specific timezone
 * */
const getTodayEventsInTimezone = async ({
  token,
  timezone,
  email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE,
}) => {
  try {
    const auth = oauth.get(token, email_scope_level);
    const calendar = google.calendar({ version: 'v3', auth });

    let calendarList = [];

    const now = moment().tz(timezone);

    // Set the start time to the beginning of the current day
    const startTime = now.startOf('day').toISOString();

    // Set the end time to the beginning of the next day
    const endTime = now.add(1, 'day').startOf('day').toISOString();

    const ls = await calendar.calendarList.list({ maxResults: 250 });
    //TODO: Handle Next Page Token when person has more than 250 calendars.
    //      Highly unlikely though
    calendarList = ls.data.items.map((cal) => cal.id);

    const eventsPromiseArray = calendarList.map((calendarId) =>
      //TODO: Handle Next Page Token when person has more than 2500 events.
      //      Highly unlikely though
      calendar.events.list({
        calendarId,
        maxResults: 2500,
        timeMin: startTime,
        timeMax: endTime,
        //timeMin: rfc3339.fromDate(), //TODO: Use next page token to fetch all
      })
    );
    const calendars = await Promise.all(eventsPromiseArray);
    return [
      calendars.map((cl, i) => ({
        calendarId: calendarList[i],
        calendarName: cl.data.summary,
        events: cl.data.items,
      })),
      null,
    ];
  } catch (err) {
    logger.error(`Error occurred while getting events by time`, err);
    return [null, err.response ? err.response.data.error : err.message];
  }
};

/**
 * @param {Object} token - Token object for google apis access
 * @param {string} token.refresh_token - Refresh token
 * @param {string} calendarId - Calendar ID in which the event belongs
 * @param {string} id - Event ID of the event that needs to be fetched
 * @description Get a single event
 */
const getSingle = async (token, calendarId, id) => {
  try {
    const auth = oauth.get(token);
    const calendar = google.calendar({ version: 'v3', auth });
    const event = await calendar.events.get({ eventId: id, calendarId });
    return [event.data, null];
  } catch (e) {
    logger.error(e);
    return [null, e.response ? err.response.data.error : err.message];
  }
};

/**
 * @param {Object} param - this is object param
 * @param {Object} param.token - Token object for google apis access
 * @param {string} param.token.refresh_token - Refresh token
 * @param {Date} param.startTime - Start time of the event. Has to be a Date object
 * @param {Date} param.endTime - End time of the event. Has to be a Date object
 * @param {string} param.conferenceName - Name of the calendar event as well as the conference in case of Google Meet
 * @param {("off"|"google"|"ringover")} param.meetType - Enum to decide whether to use Google Meet or Ringover Meet
 * @param {string} param.agenda_id - ID of the agenda for this meeting
 * @param {string} param.event_id - ID of the event to be created
 * @description Creates an event in the primary calendar of the user
 */
const create = async ({
  token,
  lead,
  startTime,
  endTime,
  conferenceName,
  meetType,
  agenda_id,
  event_id,
  ringoverMeetLink,
  eventDescription,
  addAttendees = true,
  email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE,
}) => {
  try {
    const auth = oauth.get(token, email_scope_level);
    const calendar = google.calendar({ version: 'v3', auth });

    const [leadEmails, errForLeadEmails] = await Repository.fetchAll({
      tableName: DB_TABLES.LEAD_EMAIL,
      query: {
        lead_id: lead.lead_id,
      },
    });
    if (errForLeadEmails) return [null, errForLeadEmails];

    logger.info(`Checking for primary lead email`);

    let leadEmail = '';
    let primaryFound = false;

    leadEmails.forEach((e) => {
      if (leadEmail == '' && e.email_id) leadEmail = e.email_id;
      if (e.is_primary && e.email_id) {
        primaryFound = true;
        leadEmail = e.email_id;
      }
    });

    if (primaryFound) logger.info('Primary email was found');
    else logger.info(`Primary email not found`);

    if (!leadEmail || leadEmail == '') {
      logger.error(`No valid email found`);
      return [null, `No valid email found for lead.`];
    }

    logger.info(`Email using to insert calendar event: ${leadEmail}`);

    // lead_primary_email = leadPrimaryEmail?.[0]?.email_id ?? lead.email;
    // else lead_primary_email = lead.email;
    const event = await calendar.events.insert({
      calendarId: 'primary',
      sendUpdates: 'all',
      conferenceDataVersion: 1, //Required to update meet link once it is generated as meet link generation is asynchronous
      requestBody: {
        id: event_id ? event_id : undefined,
        start: {
          dateTime: rfc3339.fromDate(startTime),
        },
        end: {
          dateTime: rfc3339.fromDate(endTime),
        },
        description: eventDescription,
        ...(addAttendees && {
          attendees: [{ email: leadEmail, responseStatus: 'needsAction' }],
        }),
        ...(!addAttendees && { attendees: [] }),
        conferenceData:
          meetType === 'google_meet'
            ? {
                createRequest: {
                  conferenceSolutionKey: {
                    type: 'hangoutsMeet',
                  },
                  name: conferenceName, //Name of Google Meet
                  requestId: nanoid(),
                },
                name: conferenceName, //Name of Google Meet
                requestId: nanoid(),
              }
            : undefined,
        summary: conferenceName, //Title of Calendar Event
        location:
          meetType === 'ringover'
            ? ringoverMeetLink ?? `meet.ringover.io/${nanoid()}`
            : undefined, // * If ringover meet link is provided then use it or auto generate one
        extendedProperties: {
          private: {
            ringover_crm_lead_id: lead.lead_id,
            ringover_crm_user_id: lead.user_id,
            ringover_crm_agenda_id: agenda_id,
            ringover_crm_last_update: 'new',
          },
        },
      },
    });
    logger.info(`Event inserted`);

    return [event.data, null];
  } catch (e) {
    logger.error(e.response ? e.response.data.error.message : e.message);
    return [null, e.response ? e.response.data.error.message : e.message];
  }
};

/**
 * @param {Object} param - this is object param
 * @param {string} param.eventId = Event ID of the event to be updated
 * @param {Object} param.token - Token object for google apis access
 * @param {string} param.token.refresh_token - Refresh token
 * @param {Date} param.startTime - Start time of the event. Has to be a Date object
 * @param {Date} param.endTime - End time of the event. Has to be a Date object
 * @param {string} param.conferenceName - Name of the calendar event as well as the conference in case of Google Meet
 * @param {("off"|"google"|"ringover")} param.meetType - Enum to decide whether to use Google Meet or Ringover Meet
 * @description Creates an event in the primary calendar of the user
 */
const update = async ({
  eventId,
  token,
  lead,
  startTime,
  endTime,
  conferenceName,
  meetType,
}) => {
  try {
    //TODO: Update this route to use old event to update
    const auth = oauth.get(token);
    const calendar = google.calendar({ version: 'v3', auth });
    let lead_primary_email = '';
    const [leadPrimaryEmail, errForLeadPrimaryEmail] =
      await Repository.fetchAll({
        tableName: DB_TABLES.LEAD_EMAIL,
        query: {
          lead_id: lead.lead_id,
        },
      });

    if (!errForLeadPrimaryEmail && leadPrimaryEmail.length !== 0)
      lead_primary_email =
        leadPrimaryEmail?.filter((leadEmail) => leadEmail?.is_primary)?.[0]
          ?.email_id || leadPrimaryEmail?.[0]?.email_id;
    // lead_primary_email = leadPrimaryEmail?.[0]?.email_id ?? lead.email;
    // else lead_primary_email = lead.email;
    const event = await calendar.events.update({
      eventId,
      calendarId: 'primary',
      sendUpdates: 'all',
      conferenceDataVersion: 1, //Required to update meet link once it is generated as meet link generation is asynchronous
      requestBody: {
        start: {
          dateTime: rfc3339.fromDate(startTime),
        },
        end: {
          dateTime: rfc3339.fromDate(endTime),
        },
        attendees: [
          { email: lead_primary_email, responseStatus: 'needsAction' },
        ],
        conferenceData:
          meetType === 'google'
            ? {
                createRequest: {
                  conferenceSolutionKey: {
                    type: 'hangoutsMeet',
                  },
                  name: conferenceName, //Name of Google Meet
                  requestId: nanoid(),
                },
              }
            : undefined,
        summary: conferenceName, //Title of Calendar Event
        location:
          meetType === 'ringover' ? `meet.ringover.io/${nanoid()}` : undefined,
        extendedProperties: {
          private: {
            ringover_crm_lead_id: lead.lead_id,
            ringover_crm_user_id: lead.user_id,
          },
        },
      },
    });
    return [event.data, null];
  } catch (e) {
    console.log(e);
    logger.error(e.response ? e.response.data.error : e.message);
    return [null, e.response ? e.response.data.error : e.message];
  }
};

const deleteEvent = async ({ eventId, token }) => {
  try {
    const auth = oauth.get(token);
    const calendar = google.calendar({ version: 'v3', auth });

    const deletedEvent = await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
    return [deletedEvent.data, null];
  } catch (err) {
    logger.error(
      `An error occured while deleting event with id ${eventId}`,
      err.response ? err?.response?.data?.error : err.message
    );
    return [null, err.response ? err?.response?.data?.error : err.message];
  }
};

const createNotificationChannel = async (token) => {
  try {
    const auth = oauth.get({ refresh_token: token });
    const calendar = google.calendar({ version: 'v3', auth });
    const response = await calendar.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: nanoid(),
        type: 'web_hook',
        address: config.GOOGLE_CALENDAR_WEBHOOK,
      },
    });
    return [response.data.id, null];
  } catch (e) {
    return [null, e.message];
  }
};

const sync = async (token, syncToken) => {
  try {
    const auth = oauth.get(token);
    const calendar = google.calendar({ version: 'v3', auth });
    let response;
    let items = [];
    console.log('Syncing...');
    do {
      console.log('Page Token:', response?.data?.nextPageToken);
      response = await calendar.events.list({
        calendarId: 'primary',
        syncToken: syncToken ? syncToken : undefined,
        pageToken: response?.data?.pageToken,
        maxResults: 2500,
      });
      items = [...items, ...response.data.items];
    } while (response?.data?.nextPageToken);
    console.log('NEXT SYNC TOKEN=>', response.data.nextSyncToken);

    return [{ ...response.data, items }, null];
  } catch (e) {
    logger.error(e.response ? e.response.data.error : e.message);
    return [null, e.response ? e.response.data.error : e.message];
  }
};

const updateLastUpdate = async (token, event, newUpdate) => {
  try {
    const auth = oauth.get(token);
    const calendar = google.calendar({ version: 'v3', auth });
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: event.id,
      requestBody: {
        ...event,
        extendedProperties: {
          private: {
            ...event.extendedProperties.private,
            ringover_crm_last_update: newUpdate,
          },
        },
      },
    });
    return [response.data, null];
  } catch (e) {
    console.log(e);
    return [(null, e)];
  }
};

const getRecurringInstances = async (token, syncToken, id) => {
  try {
    const auth = oauth.get(token);
    const calendar = google.calendar({ version: 'v3', auth });
    let response;
    let items = [];
    do {
      console.log('Page Token:', response?.data?.nextPageToken);
      response = await calendar.events.instances({
        calendarId: 'primary',
        eventId: id,
        pageToken: response?.data?.pageToken,
        maxResults: 2500,
      });
      items = [...items, ...response.data.items];
    } while (response?.data?.nextPageToken);
    return [{ ...response.data, items }, null];
  } catch (e) {
    console.log(e.message);
    return [(null, e)];
  }
};

const Events = {
  getMultiple,
  getMultipleTimeframe,
  getTodayEventsInTimezone,
  getSingle,
  create,
  update,
  deleteEvent,
  createNotificationChannel,
  sync,
  updateLastUpdate,
  getRecurringInstances,
};

module.exports = Events;
