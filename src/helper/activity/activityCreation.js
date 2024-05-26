// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { CUSTOM_TASK_NODE_ID, ACTIVITY_TYPE } = require('../../utils/enums');

// Packages
const { nanoid } = require('nanoid');

// Repositories
const Repository = require('../../repository');
const ActivityRepository = require('../../repository/activity.repository');
const SocketHelper = require('../socket');
const JsonHelper = require('../json');

const activityCreation = async (activity, user_id, start_time = null) => {
  try {
    if (!activity.lead_id) return [null, 'no lead id provided'];
    const [createdActivity, errForCreatedActivity] =
      await ActivityRepository.createActivity(activity);
    if (errForCreatedActivity) return [null, errForCreatedActivity];

    const [user, errForUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: { user_id },
    });
    if (errForUser) return [null, errForUser];

    let parsedActivity = JsonHelper.parse(createdActivity);

    // send start time and task_type for custom task if custom task activity

    if (start_time) parsedActivity.start_time = start_time;

    if (
      [ACTIVITY_TYPE.CUSTOM_TASK, ACTIVITY_TYPE.CUSTOM_TASK_FOR_OTHER].includes(
        parsedActivity.type
      ) &&
      parsedActivity?.node_id
    )
      parsedActivity.task_type = Object.keys(CUSTOM_TASK_NODE_ID).find(
        (key) => CUSTOM_TASK_NODE_ID[key] == parsedActivity?.node_id
      );

    const [sendActivity, errForSend] = await SocketHelper.sendActivity({
      user_id,
      email: user.email,
      activity: parsedActivity,
    });
    if (errForSend)
      return [null, `Error occurred while sending activity: ${errForSend}`];

    return [parsedActivity, null];
  } catch (err) {
    logger.error(
      `Error while creating activity and sending via socket: ${err.message}`
    );
    return [null, err.message];
  }
};

//activityCreation(
//{
//name: 'Cadence has been completed',
//status: ` has been completed.`,
//type: 'cadence',
//lead_id: 1,
//node_id: null,
//user_id: 2,
//},
//2
//);

const bulkActivityCreation = async (activities) => {
  try {
    const [bulkActivity, errForCreateBulkActivity] =
      await ActivityRepository.createBulkActivity(activities);
    if (errForCreateBulkActivity) return [null, errForCreateBulkActivity];

    const sendActivities = await Promise.all(
      activities.map((activity, ind) => {
        activity.activity_id = nanoid();
        return SocketHelper.sendActivity({
          user_id: activity.user_id,
          activity,
        });
      })
    );
    return ['Created Activities and sent', null];
  } catch (err) {
    logger.error(
      `Error while bulk creating activities and sending via socket: ${err.message}`
    );
    return [null, err.message];
  }
};

//bulkActivityCreation([
//{
//name: 'Cadence has been completed',
//status: ` has been completed.`,
//type: 'cadence',
//lead_id: 1,
//node_id: null,
//user_id: 1,
//},
//]);

module.exports = {
  bulkActivityCreation,
  activityCreation,
};
