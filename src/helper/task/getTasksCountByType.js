// Utils
const logger = require('../../utils/winston');
const { NODE_TYPES } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Repositories
const TaskRepository = require('../../repository/task.repository');

// Helpers and services
const LeaderboardHelper = require('../leaderboard');

const getTasksCountByType = async (users, filter) => {
  try {
    let result = [];
    // console.log(JSON.stringify(users,null,4));
    for (let user of users) {
      user = JSON.parse(JSON.stringify(user));

      // * fetch date filter
      const dateRange = LeaderboardHelper.dateFilters[filter](user.timezone);

      let [tasksCounts, errForTasksCounts] =
        await TaskRepository.getTasksByType({
          user_id: user.user_id,
          completed: 1,
          complete_time: {
            [Op.between]: dateRange,
          },
        });
      if (errForTasksCounts) return [null, errForTasksCounts];

      tasksCounts = JSON.parse(JSON.stringify(tasksCounts));

      let noOfMessages = 0;
      let noOfEmails = 0;
      let noOfCalls = 0;
      let noOfTasksDone = 0;

      tasksCounts.map((tasksCount) => {
        if (tasksCount?.Node?.type === NODE_TYPES.CALL) {
          noOfCalls += tasksCount?.count || 0;
        } else if (tasksCount?.Node?.type === NODE_TYPES.MESSAGE) {
          noOfMessages += tasksCount?.count || 0;
        } else if (tasksCount?.Node?.type === NODE_TYPES.MAIL) {
          noOfEmails += tasksCount?.count || 0;
        }
      });

      noOfTasksDone = noOfCalls + noOfEmails + noOfMessages;
      result.push({
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        Sub_Department: user.Sub_Department,
        profile_picture: user.profile_picture,
        is_profile_picture_present: user.is_profile_picture_present,
        tasks: {
          noOfCalls,
          noOfEmails,
          noOfMessages,
          noOfTasksDone,
        },
      });
    }

    return [result, null];
  } catch (err) {
    logger.error(`Error while fetching tasks count by node type: `, err);
    return [null, err.message];
  }
};

module.exports = getTasksCountByType;
