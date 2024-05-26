// Utils
const logger = require('../../utils/winston');
const { LEAD_STATUS, ACTIVITY_TYPE, NODE_TYPES } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repositories
const ActivityRepository = require('../../repository/activity.repository');
const TaskRepository = require('../../repository/task.repository');
const StatusRepository = require('../../repository/status.repository');
const LeadRepository = require('../../repository/lead.repository');

// Helpers and services
const LeaderboardHelper = require('../leaderboard');

const getMetricsForUser = async (users, filter) => {
  try {
    let result = [];

    let dateRange = [];

    const activityFieldName = {
      [ACTIVITY_TYPE.CALL]: 'no_of_calls',
      [ACTIVITY_TYPE.MAIL]: 'no_of_mails',
      [ACTIVITY_TYPE.MESSAGE]: 'no_of_messages',
    };

    for (let user of users) {
      //   let noOfMessages = 0;
      //   let noOfMails = 0;
      //   let noOfCalls = 0;
      let noOfConverted = 0;
      let timeTillFirstCall = 0;
      let noOfDisqualified = 0;

      dateRange = LeaderboardHelper.dateFilters[filter](user?.timezone);
      serverDateRange = LeaderboardHelper.dateFilters[filter]('UTC'); // * to query for created_at

      let statusPromise = StatusRepository.getStatusForLeadQuery(
        {
          status: {
            [Op.in]: [LEAD_STATUS.TRASH, LEAD_STATUS.CONVERTED],
          },

          created_at: sequelize.where(
            sequelize.literal('unix_timestamp(Status.created_at)*1000'),
            {
              [Op.between]: serverDateRange,
            }
          ),
        },
        {
          user_id: user.user_id,
        }
      );

      const avgTimeTillFirstCallPromise =
        LeadRepository.getAvgTimeTillFirstCall({
          user_id: user.user_id,
          created_at: sequelize.where(
            sequelize.literal('unix_timestamp(Lead.created_at)*1000'),
            {
              [Op.between]: serverDateRange,
            }
          ),
        });

      let [
        [statuses, errForStatuses],
        [avgTimetillFirstCall, errForAvgTimeTillFirstCall],
      ] = await Promise.all([statusPromise, avgTimeTillFirstCallPromise]);

      statuses = JSON.parse(JSON.stringify(statuses));

      statuses?.map((status) => {
        if (status?.status === LEAD_STATUS.CONVERTED)
          noOfConverted = status?.count || 0;

        if (status?.status === LEAD_STATUS.TRASH)
          noOfDisqualified = status?.count || 0;
      });

      if (avgTimetillFirstCall?.length)
        timeTillFirstCall = avgTimetillFirstCall?.[0]?.avg_time_for_call || 0;

      // console.log(JSON.parse(JSON.stringify(status)));

      // // * map through leads to get leadIds and also keep a track of noOfConverted and timeTillFirstCall
      // const leadIds = user.Leads.map((lead) => {
      //   if (lead.status === LEAD_STATUS.CONVERTED) noOfConverted += 1;

      //   if (lead.status === LEAD_STATUS.TRASH) noOfDisqualified += 1;

      //   timeTillFirstCall += lead.avg_time_till_first_call;

      //   return lead?.lead_id;
      // }); // * ids of all leads

      // console.log(`User: ${user.first_name} ${user.last_name}.`);

      // console.log(noOfConverted);

      // * fetch activity metric by type
      const [activityMetric, errForActivityMetric] =
        await ActivityRepository.getActivitiesByType(
          {
            incoming: 0, // * we should only count outgoing activities
            created_at: sequelize.where(
              sequelize.literal('unix_timestamp(Activity.created_at)*1000'),
              {
                [Op.between]: serverDateRange,
              }
            ),
          },
          {
            user_id: user.user_id,
          }
        );

      // console.log(activityMetric);

      let userMetric = {};

      // * store metric for activity type whose count is found
      activityMetric.map((metric) => {
        // metric = metric.Activities;
        if (activityFieldName[metric.type])
          userMetric[activityFieldName[metric.type]] = metric.count;
      });

      // // * get noOfConverted in percentage form
      // user.noOfConverted =
      //   parseInt((noOfConverted / user.Leads.length) * 100) || 0;
      user.noOfConverted = noOfConverted;

      // * calculate avg for time till first call
      user.avg_time_till_first_call =
        timeTillFirstCall / user.Leads.length || 0;

      user.noOfDisqualified = noOfDisqualified;

      // * delete Leads as they are not required
      delete user.Leads;

      const [noOfCompletedTasks, errForNoOfCompletedTasks] =
        await TaskRepository.getCountForUserTasks(
          {
            completed: 1,
            user_id: user.user_id,
            complete_time: {
              // * see for completed tasks between dateRange
              [Op.between]: dateRange,
            },
          },
          {
            type: {
              [Op.notIn]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
          }
        );

      const [totalTasks, errForTotalTasks] =
        await TaskRepository.getCountForUserTasks(
          {
            completed: 0,
            is_skipped: 0,
            user_id: user.user_id,
            start_time: {
              // * see for tasks not completed in dateRange
              [Op.between]: dateRange,
            },
          },
          {
            type: {
              [Op.notIn]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
          }
        );

      userMetric.completed_tasks = noOfCompletedTasks || 0;
      userMetric.no_of_tasks = totalTasks || 0;

      delete user.Tasks;

      // * push the required result for the user
      result.push({
        ...JSON.parse(JSON.stringify(user)),
        metric: userMetric,
      });
    }

    return [result, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while fetching metrics for user: ${err.message}.`);
    return [null, err.message];
  }
};

module.exports = getMetricsForUser;
