// Utils
const {
  REDIS_TASK_SUMMARY,
  REDIS_TASK_SUMMARY_EXPIRY,
} = require('../../utils/constants');
const { ACTIVITY_TYPE } = require('../../utils/enums');
const logger = require('../../utils/winston');

// Helpers and Services
const RedisHelper = require('../redis');
const fetchTaskSummary = require('./fetchTaskSummary');

/**
 * @param {String} user_id - user id of user whose task summary is needed
 * @param {Boolean} toUpdateInRedis - to update in redis or not
 * @param {Object} activity - if task summmary is fetched from redis, and toUpdateInRedis is true, then activity type count will be increased
 * @param {Number} taskIncrementCount - number by which task count should be incrementedm if toUpdateInRedis is true
 *
 */
const findOrCreateTaskSummary = async ({
  user_id,
  toUpdateInRedis = false,
  activity = {},
  taskIncrementCount = 0,
}) => {
  try {
    if (!user_id) return [null, `User id not provide.`];
    let taskSummary = '',
      errForTaskSummary = '';

    [taskSummary, errForTaskSummary] = await RedisHelper.getValue(
      REDIS_TASK_SUMMARY + `_${user_id}`
    );

    // if found return
    if (taskSummary) {
      taskSummary = JSON.parse(taskSummary);

      // if toUpdateInRedis is true then update in redis, then return updated value
      if (toUpdateInRedis) {
        taskSummary.tasks += taskIncrementCount;

        if (
          [
            ACTIVITY_TYPE.CALL,
            ACTIVITY_TYPE.MESSAGE,
            ACTIVITY_TYPE.MAIL,
            ACTIVITY_TYPE.REPLY_TO,
          ].includes(activity.type)
        ) {
          if (taskSummary?.activities?.length) {
            let updated = false;
            taskSummary.activities.map((activityObject) => {
              if (activityObject.type === activity.type) {
                updated = true;
                activityObject.count += 1;
              }
            });
            if (!updated)
              taskSummary.activities.push({ type: activity.type, count: 1 });
          } else taskSummary.activities = [{ type: activity.type, count: 1 }];
        }

        const [created, errForCreated] = await RedisHelper.setWithExpiry(
          REDIS_TASK_SUMMARY + `_${user_id}`,
          JSON.stringify(taskSummary),
          REDIS_TASK_SUMMARY_EXPIRY
        );

        if (errForCreated) return [null, errForCreated];

        logger.info(`Task summary updated in redis for ${user_id}.`);
      }

      return [taskSummary, null];
    }
    logger.info(`Task summary not found in redis for ${user_id}.`);

    // if not found, fetch from db and store
    const [data, err] = await fetchTaskSummary(user_id);

    if (err) return [null, err];

    const [created, errForCreated] = await RedisHelper.setWithExpiry(
      REDIS_TASK_SUMMARY + `_${user_id}`,
      JSON.stringify(data),
      REDIS_TASK_SUMMARY_EXPIRY
    );

    if (errForCreated) return [null, errForCreated];

    logger.info(
      `Task summary fetched from db and created in redis for ${user_id}.`
    );
    return [data, err];
  } catch (err) {
    logger.error(`Error while finding or creating task summary: `, err);
    return [null, err.message];
  }
};

//findOrCreateTaskSummary({
//user_id: 'a3fe4ec3-fcf1-4544-8556-c98268e169cf',
//toUpdateInRedis: true,
//taskIncrementCount: 1,
//activity: { type: ACTIVITY_TYPE.CALL },
//});

module.exports = findOrCreateTaskSummary;
