// Utils
const logger = require('../../utils/winston');
const { TASK_SERVICE } = require('../../utils/config');

// Packages
const axios = require('axios');

const recalculateDailyTasksForSdUsers = async (sd_id) => {
  try {
    // * tell task service to calculate tasks for users of this sd
    const res = await axios.get(`${TASK_SERVICE}/tasks/calculate/sd/${sd_id}`);
    logger.info(JSON.stringify(res.data, null, 4));
    return [`Sent request to task service.`, null];
  } catch (err) {
    logger.error(`Error while recalculating daily tasks for sd users: `, err);
    return [null, err.message];
  }
};

module.exports = recalculateDailyTasksForSdUsers;
