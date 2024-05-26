// Utils
const logger = require('../../../utils/winston');

// events are event array
const convertEventsToGoogleFormat = (events) => {
  try {
    let formattedEvents = [];
    if (!events) {
      return [null, 'No event found'];
    }
    if (events?.length === 0) return [null, `No event found.`];
    if (!events?.length) {
      //if its a singlular object event
      events = [events];
    }
    events.forEach((e) => {
      //single object will also be converted to array and resolved
      const newEvent = {
        id: e.id,
        description: e.body.content,
        end: e.end,
        start: e.start,
        hangoutLink: e?.onlineMeetingUrl ?? e.location?.displayName ?? null, //contains skype/teams/ringover meeting link
        status: 'confirmed',
        created: e.createdDateTime,
        summary: e.subject,
        attendees: e.attendees ?? [],
        location: e?.location?.displayName ?? null,
      };
      formattedEvents.push(newEvent);
    });
    return [formattedEvents, null];
  } catch (err) {
    logger.error(
      `Error in converting outlook event to google event format`,
      err
    );
    return [null, err.message];
  }
};

module.exports = convertEventsToGoogleFormat;
