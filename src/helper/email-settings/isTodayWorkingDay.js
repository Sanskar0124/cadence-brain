// Utils
const logger = require('../../utils/winston');

/**
 * @returns if today is working day or not form given email setting
 */
const isTodayWorkingDay = (emailSetting) => {
  try {
    // * today's day
    let dayForToday = new Date().getDay();

    // * Since JS returns 0 for SUNDAY and we store MONDAY as 0 in our db, subtract 1 from value returned by JS
    dayForToday = dayForToday - 1 < 0 ? 6 : dayForToday - 1;

    return emailSetting.working_days[dayForToday];
  } catch (err) {
    logger.error(`Error while checking for working day for today: `, err);
    return false;
  }
};

module.exports = isTodayWorkingDay;
