// Utils
const logger = require('../../utils/winston');

// Helpers and services
const RandomHelper = require('../random');

/**
 * @returns delay i.e. time to wait before sending a mail in minutes
 */
const getDelay = (emailSetting) => {
  try {
    // * If wait time is random
    if (emailSetting.is_wait_time_random) {
      const delay = RandomHelper.getRandomInteger(
        emailSetting.wait_time_lower_limit,
        emailSetting.wait_time_upper_limit
      );
      return delay;
    } else {
      // * wait time is fixed
      return emailSetting.delay;
    }
  } catch (err) {
    logger.error(
      `Error occured while calculating delay from email setting: `,
      err
    );
    return 0;
  }
};

module.exports = getDelay;
