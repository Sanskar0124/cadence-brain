// Utils
const logger = require('../../utils/winston');

/**
 * @returns time in unix format
 */
const getStartTimeForNextWorkingDay = (emailSetting) => {
  try {
    let { working_days, start_hour: startHour } = emailSetting;

    startHour = parseInt(startHour.split(':')[0]);

    // * Find next nearest working day
    // * today's day
    let dayForToday = new Date().getDay();

    // * Since JS returns 0 for SUNDAY and we store MONDAY as 0 in our db, subtract 1 from value returned by JS
    dayForToday = dayForToday - 1 < 0 ? 6 : dayForToday - 1;

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

    // * get hour foe start of next working day
    const delayInHours = delayInDays * 24 + startHour;

    // * return time in unix format
    return new Date().setHours(delayInHours, 0, 0, 0);
  } catch (err) {
    logger.error(`Error while fetching time for next working day: `, err);
    return new Date().getTime();
  }
};

module.exports = getStartTimeForNextWorkingDay;
