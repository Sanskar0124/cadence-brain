// Utils
const logger = require('../../utils/winston');
const { TASK_SERVICE } = require('../../utils/config');

// Packages
const axios = require('axios');

const recalculateDailyTasksForCadenceUsers = async (cadence_id) => {
  try {
    // * tell task service to calculate tasks for users of this cadence
    const res = await axios.get(
      `${TASK_SERVICE}/tasks/calculate/${cadence_id}`
    );
    logger.info(JSON.stringify(res.data, null, 4));
    return [`Sent request to task service.`, null];
  } catch (err) {
    logger.error(
      `Error while recalculating daily tasks for cadence users: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = recalculateDailyTasksForCadenceUsers;
