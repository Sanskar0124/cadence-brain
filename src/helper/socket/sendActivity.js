// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { ACTIVITY_TYPE } = require('../../utils/enums');

const client = require('./setup');

const Repository = require('../../repository');

const findOrCreateTaskSummary = require('../task/findOrCreateTaskSummary');

const sendActivity = async ({ user_id, email, activity }) => {
  try {
    let user, errForUser;
    if (!email) {
      [user, errForUser] = await Repository.fetchOne({
        tableName: DB_TABLES.USER,
        query: { user_id },
      });
      if (errForUser) return [null, `Error while fetching user: ${errForUser}`];
      if (!user) return [null, 'User not found.'];

      email = user.email;
      user_id = user.user_id;
    }

    // fetch lead name for homepage
    if (activity?.lead_id) {
      const [lead, errForLead] = await Repository.fetchOne({
        tableName: DB_TABLES.LEAD,
        query: {
          lead_id: activity.lead_id,
        },
        extras: {
          attributes: ['full_name'],
        },
      });
      if (errForLead) return [null, `Error while fetching lead: ${errForLead}`];

      activity.Lead = lead;
    }

    let data = await client.sendActivity({
      email,
      activity: JSON.stringify(activity),
    });
    if (
      [
        ACTIVITY_TYPE.CALL,
        ACTIVITY_TYPE.MESSAGE,
        ACTIVITY_TYPE.MAIL,
        ACTIVITY_TYPE.REPLY_TO,
      ].includes(activity.type)
    ) {
      // fetch task summary
      const [taskSummary, errForTaskSummary] = await findOrCreateTaskSummary({
        user_id: user_id ?? user?.user_id,
        toUpdateInRedis: true,
        activity,
      });
      if (taskSummary)
        await client.sendUpdateCompleteTask({
          email,
          task_summary: JSON.stringify(taskSummary),
        });
    }
    if (data?.success) return [data.msg, null];
    else return [null, data?.msg];
  } catch (err) {
    logger.error(
      'Error while sending activity to socket service via grpc: ',
      err
    );
    // console.log('Stack trace sendActivity.js: ', err);
    return [null, err.message];
  }
};

module.exports = sendActivity;
