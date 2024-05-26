// Utils
const logger = require('../../utils/winston');

// Helpers and services
const UserHelper = require('../user');

/**
 * @returns time in unix format
 */
const getStartTimeForNextWorkingDay = (emailSetting, timezone) => {
  try {
    let { working_days, start_hour: startHour } = emailSetting;

    startHour = parseInt(startHour.split(':')[0]);

    let todayStartTimeInUnix = UserHelper.setHoursForTimezone(
      startHour,
      new Date().getTime(),
      timezone
    );

    todayStartTimeInUnix +=
      parseInt(emailSetting?.start_hour?.split(':')[1]) * 60 * 1000 || 0;

    // * Find next nearest working day
    // * today's day
    let dayForToday = new Date().getDay();

    // * Since JS returns 0 for SUNDAY and we store MONDAY as 0 in our db, subtract 1 from value returned by JS
    dayForToday = dayForToday - 1 < 0 ? 6 : dayForToday - 1;

    // * If today is working day and time is less than today's start time then return
    if (
      working_days[dayForToday] &&
      new Date().getTime() < todayStartTimeInUnix
    )
      return todayStartTimeInUnix;

    // * start from dayForToday index
    let index = dayForToday + 1;

    // * Since we start from dayForToday index
    let delayInDays = 1;

    while (true) {
      // * If index exceeds 6, start from beginning of array
      if (index > 6) {
        index = 0;
      }

      if (working_days[index]) {
        // * If found, we have our delayInDays
        break;
      }

      // * If not found, increment index and delayInDays
      index += 1;
      delayInDays += 1;
    }

    // * get hour for start of next working day
    const delayInHours = delayInDays * 24 + startHour;

    // * return time in unix format
    // return new Date().setHours(delayInHours, 0, 0, 0);
    return UserHelper.setHoursForTimezone(
      delayInHours,
      new Date().getTime(),
      timezone
    );
  } catch (err) {
    logger.error(
      `Error while fetching time for next working day: ${err.message}.`
    );
    return new Date().getTime();
  }
};

// console.log(
//   getStartTimeForNextWorkingDay(
//     {
//       working_days: [1, 1, 1, 1, 0, 0, 1],
//       start_hour: '10:00',
//     },
//     'Asia/Kolkata'
//   )
// );

module.exports = getStartTimeForNextWorkingDay;
