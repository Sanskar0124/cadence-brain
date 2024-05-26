// Utils
const logger = require('../../utils/winston');
const { NODE_TYPES } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Models
const { sequelize } = require('../../db/models');

// Repositories
const TaskRepository = require('../../repository/task.repository');
const UserRepository = require('../../repository/user-repository');
const ActivityRepository = require('../../repository/activity.repository');

// Helpers and services
//const UserHelper = require('../user');
const { setHoursForTimezone } = require('../user/getDateForTimezone');

const fetchTaskSummary = async (user_id) => {
  try {
    // fetch user
    const [user, errForUser] = await UserRepository.findUserByQuery({
      user_id,
    });

    if (errForUser)
      return [null, `Error while fetching completed tasks: ${errForUser}.`];

    if (!user) return [null, `Requested user not found.`];

    // fetch time range in unix for today for user
    const timeRangeForToday = [
      setHoursForTimezone(0, new Date().getTime(), user.timezone),
      setHoursForTimezone(24, new Date().getTime(), user.timezone),
    ];
    //console.log(timeRangeForToday.map((t) => new Date(t).toLocaleString()));

    // promise to fetch completed tasks in time range
    const completedTasksPromise = TaskRepository.getCountForUserTasks(
      {
        user_id, // belongs to the requested user
        completed: 1,
        complete_time: {
          // was completed today
          [Op.between]: timeRangeForToday,
        },
      },
      {
        type: {
          [Op.notIn]: [
            NODE_TYPES.AUTOMATED_MAIL,
            NODE_TYPES.AUTOMATED_MESSAGE,
            NODE_TYPES.AUTOMATED_REPLY_TO,
          ],
        },
      }
    );
    // promise to fetch count of activities by type in time range
    const activitiesCountPromise = ActivityRepository.getActivitiesByType(
      {
        // activity query
        incoming: 0, // * we should only count outgoing activities
        created_at: sequelize.where(
          sequelize.literal('unix_timestamp(Activity.created_at)*1000'),
          {
            [Op.between]: timeRangeForToday,
          }
        ),
      },
      {
        // lead query
        user_id,
      }
    );

    // resolve all promises
    const [
      [completedTasks, errForCompletedTasks],
      [activitiesCount, errForActivitiesCount],
    ] = await Promise.all([completedTasksPromise, activitiesCountPromise]);

    if (errForCompletedTasks)
      return [
        null,
        `Error while fetching count summary: ${errForCompletedTasks}.`,
      ];

    if (errForActivitiesCount)
      return [
        res,
        `Error while fetching count summary: ${errForActivitiesCount}).`,
      ];

    const data = {
      tasks: completedTasks || 0,
      activities: activitiesCount,
    };

    return [data, null];
  } catch (err) {
    logger.error(`Error while fetching task summary: `, err);
    return [null, err.message];
  }
};

module.exports = fetchTaskSummary;
