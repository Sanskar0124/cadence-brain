// Utils
const logger = require('../../utils/winston');

// Helpers and Services
const UserHelper = require('../user');

/**
 *
 * @param {Object} settings
 * @param {String} timezone - timezone for which we have to check
 * @returns {Boolean} - is function called in working time.
 */
const isInWorkingTime = (settings, timezone) => {
  try {
    let { start_hour, end_hour } = settings;

    let start_time = start_hour.split(':');
    let end_time = end_hour.split(':');

    if (start_time.length !== 2) {
      logger.info(start_time);
      logger.info(`Error while retriveing start_time from settings for user.`);
      return [
        null,
        `Error while retriveing start_time from settings for user.`,
      ];
    }

    if (end_time.length !== 2) {
      logger.info(end_time);
      logger.info(`Error while retriveing end_time from settings for user.`);
      return [null, `Error while retriveing end_time from settings for user.`];
    }

    let startTimeInUnix = UserHelper.setHoursForTimezone(
      parseInt(start_time[0]),
      new Date().getTime(),
      timezone
    );

    // * add minutes
    startTimeInUnix += parseInt(start_time[1]) * 60 * 1000;

    let endTimeInUnix = UserHelper.setHoursForTimezone(
      parseInt(end_time[0]),
      new Date().getTime(),
      timezone
    );

    // * add minutes
    endTimeInUnix += parseInt(end_time[1]) * 60 * 1000;

    let currTimeInUnix = new Date().getTime();

    return currTimeInUnix >= startTimeInUnix && currTimeInUnix <= endTimeInUnix;
  } catch (err) {
    logger.error(`Error while checking if it is in working time: `, err);
    return false;
  }
};

module.exports = isInWorkingTime;
