// Utils
const logger = require('../../utils/winston');
const { TASK_SERVICE } = require('../../utils/config');

// Packages
const axios = require('axios');

const recalculateDailyTasksForUsers = async (userIds = []) => {
  try {
    if (userIds && !userIds?.length)
      return [null, `Expected array of userIds as an argument.`];
    // * tell task service to calculate tasks for users of this cadence
    const res = await axios.post(`${TASK_SERVICE}/tasks/calculate/users`, {
      userIds,
    });
    logger.info(JSON.stringify(res.data, null, 4));
    return [`Sent request to task service.`, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while recalculating daily tasks for  users: `, err);
    return [null, err.message];
  }
};

module.exports = recalculateDailyTasksForUsers;
