// Utils
const logger = require('../../utils/winston');
const {
  NODE_TYPES,
  CADENCE_PRIORITY,
  TASK_FILTERS,
  SORT_TYPES,
  CUSTOM_TASK_NODE_ID,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const TaskRepository = require('../../repository/task.repository');
const UserRepository = require('../../repository/user-repository');

// Helpers and services
const UserHelper = require('../user');
const { getTaskFilters } = require('./getTaskFilters');

const getPendingTasks = async (
  user_id,
  filter,
  sort_type,
  start_time = new Date().getTime()
) => {
  try {
    // * get filter for sequelize
    let [filterArray, errForFilterArray] = getTaskFilters(filter, sort_type);
    //console.log("FILTER ARRAY: ", filterArray);
    if (errForFilterArray) return [null, errForFilterArray];
    const [user, errForUser] = await UserRepository.findUserByQuery({
      user_id,
    });

    if (errForUser) return [null, errForUser];

    let tasks = [];

    let tasksWithNoNode = [];
    let errForTasksWithNoNode = '';

    // * taskQuery
    // TODO:TASK MIGRATION
    let taskQuery = {
      user_id,
      completed: 0, // * not yet completed
      is_skipped: 0,
      start_time: {
        [Op.lte]: start_time, // * time is less than or equal to current time
      },
    };

    // * if filter is custom task with type only then avoid tasks associated with nodes
    if (
      !(filter === TASK_FILTERS.CUSTOM_TASK && sort_type === SORT_TYPES.ONLY)
    ) {
      // * fetch pending tasks

      // * Not using this in Promise.all(), since its value is required in other 2 promises.
      let settingsPromise = UserHelper.getSettingsForUser({
        user_id,
        setting_type: DB_TABLES.TASK_SETTINGS,
      });

      // * get current timestamp
      const currentStartTime = new Date().getTime();

      // * get today's start time in ms
      const todayStartTimeInMs = UserHelper.setHoursForTimezone(
        0,
        currentStartTime,
        user?.timezone
      );

      // * get today's end time in ms
      const todayEndTimeInMs = UserHelper.setHoursForTimezone(
        24,
        currentStartTime,
        user?.timezone
      );

      // * get todays completed tasks(non-automated)
      const completedTasksPromise = TaskRepository.getTasksByCadenceAndNode(
        {
          // * task query
          completed: 1, // TODO:TASK MIGRATION
          user_id: user.user_id,
          complete_time: {
            [Op.between]: [todayStartTimeInMs, todayEndTimeInMs],
          },
        },
        {}, // * cadence query
        {
          // * node query
          type: {
            [Op.notIn]: [
              NODE_TYPES.AUTOMATED_MAIL,
              NODE_TYPES.AUTOMATED_MESSAGE,
            ],
          },
        }
      );

      const [
        [settings, errForSettings],
        [completedTasks, errForCompletedTasks],
      ] = await Promise.all([settingsPromise, completedTasksPromise]);

      if (errForSettings)
        return [null, `Error fetching settings: ${errForSettings}.`];

      if (errForCompletedTasks)
        return [
          null,
          `Error while calculating completed tasks: ${errForCompletedTasks}.`,
        ];

      let taskSettings = settings?.Task_Setting;
      if (!taskSettings) return [null, `Could not fetch task-settings.`];

      let highPriorityCompletedTasks = 0; // * count for tasks completed which belongs to high priority cadence
      let standardPriorityCompletedTasks = 0; // * count for tasks completed which belongs to cadence priority cadence

      completedTasks.map((completedTask) => {
        if (completedTask?.Cadence?.priority === CADENCE_PRIORITY.HIGH)
          highPriorityCompletedTasks = completedTask?.count || 0;
        else if (completedTask?.Cadence?.priority === CADENCE_PRIORITY.STANDARD)
          standardPriorityCompletedTasks = completedTask?.count || 0;
      });

      // * find today's task limit left, by subtracting total tasks completed today from max_tasks.
      let todaysTasksLimitLeft = taskSettings.max_tasks;
      // console.log(
      //   `MAX TASKS FOR A DAY: ${sdSettings.max_tasks}, HIGH PRIORITY COMPLETED TASKS: ${highPriorityCompletedTasks}, STANDARD PRIORITY COMPLETED TASKS: ${standardPriorityCompletedTasks}`
      // );
      // * If completed tasks are equal to max tasks, then add "tasks_to_be_added_per_day" set by the user to limit of today's tasks left.
      if (todaysTasksLimitLeft === 0)
        todaysTasksLimitLeft += taskSettings.tasks_to_be_added_per_day;

      // console.log(`TODAY TASKS LIMIT: ${todaysTasksLimitLeft}`);

      // * If filter is for tomorrow task, then change the start time to tomorrow
      if (filter === TASK_FILTERS.TOMORROW_TASK)
        // get tasks till tomorrow's end time
        taskQuery.start_time = {
          [Op.lte]: todayEndTimeInMs + 24 * 60 * 60 * 1000,
        };

      // * resolving this in Promise.all()
      const highPriorityPromise = TaskRepository.getTasksInPriority(
        taskQuery,
        CADENCE_PRIORITY.HIGH,
        filterArray
        // todaysTasksLimitLeft * (sdSettings?.high_priority_split / 100)
      );

      // * resolving this in Promise.all()
      const standardPriorityPromise = TaskRepository.getTasksInPriority(
        taskQuery,
        CADENCE_PRIORITY.STANDARD,
        filterArray
        // todaysTasksLimitLeft * ((100 - sdSettings?.high_priority_split) / 100)
      );

      let [
        [highPriorityTasks, errForHighPriorityTasks],
        [standardPriorityTasks, errForStandardPriorityTasks],
      ] = await Promise.all([highPriorityPromise, standardPriorityPromise]);

      // * Error handling for above promises
      if (errForHighPriorityTasks)
        return [
          null,
          `Error while fetching high priority tasks: ${errForHighPriorityTasks}.`,
        ];

      if (errForStandardPriorityTasks)
        return [
          null,
          `Error while fetching standard priority tasks: ${errForStandardPriorityTasks}`,
        ];

      // * calculate limit for high priority tasks
      const originalHighPriorityLimit = Math.floor(
        todaysTasksLimitLeft * (taskSettings?.high_priority_split / 100)
      );

      // * calculate limit for standar priority tasks
      const originalStandardPriorityLimit = Math.floor(
        todaysTasksLimitLeft * ((100 - taskSettings?.high_priority_split) / 100)
      );
      // console.log(
      //   `ORIGINAL HIGH TASKS LIMIT: ${originalHighPriorityLimit}, ORIGINAL STANDARD TASKS LIMIT: ${originalStandardPriorityLimit}`
      // );

      let highPriorityLimitLeft =
        originalHighPriorityLimit - highPriorityCompletedTasks;
      let standardPriorityLimitLeft =
        originalStandardPriorityLimit - standardPriorityCompletedTasks;

      // console.log(
      //   `HIGH TASKS LIMIT LEFT: ${highPriorityLimitLeft}, STANDARD TASKS LIMIT LEFT: ${standardPriorityLimitLeft}`
      // );

      // console.log(
      //   `HIGH PRIORITY TASKS FOUND: ${highPriorityTasks?.length},STANDARD PRIORITY TASKS FOUND: ${standardPriorityTasks?.length}`
      // );

      // * If high priority limit is not met, then add the remaining limit to the standard priority limit
      if (highPriorityTasks.length < highPriorityLimitLeft) {
        // logger.info(
        //   `INCREASING STANDARD PRIORITY TASKS LIMIT, SINCE THERE ARE NOT ENOUGH HIGH PRIORITY TASKS...`
        // );
        standardPriorityLimitLeft +=
          highPriorityLimitLeft - highPriorityTasks.length;
      }

      // * If standard priority limit is not met, then add the remaining limit to the high priority limit
      if (standardPriorityTasks.length < standardPriorityLimitLeft) {
        // logger.info(
        //   `INCREASING HIGH PRIORITY TASKS LIMIT, SINCE THERE ARE NOT ENOUGH STANDARD PRIORITY TASKS...`
        // );
        highPriorityLimitLeft +=
          standardPriorityLimitLeft - standardPriorityTasks.length;
      }

      /**
       * * here highPriorityLimitLeft is the limit of high priority tasks for today
       * * here standardPriorityLimitLeft is the limit of standard priority tasks for today
       * *
       * * If filter is "tomorrow tasks", then at this point of time
       * * future tasks will be percentage of max tasks depending on split for priority, starting from highPriorityLimitLeft/standardPriorityLimitLeft
       */

      if (filter === TASK_FILTERS.TOMORROW_TASK) {
        highPriorityTasks = highPriorityTasks.slice(
          highPriorityLimitLeft,
          highPriorityLimitLeft + originalHighPriorityLimit
        );
        standardPriorityTasks = standardPriorityTasks.slice(
          standardPriorityLimitLeft,
          standardPriorityLimitLeft + originalStandardPriorityLimit
        );
        // console.log(
        //   highPriorityLimitLeft,
        //   highPriorityLimitLeft + originalHighPriorityLimit,
        //   standardPriorityLimitLeft,
        //   standardPriorityLimitLeft + originalStandardPriorityLimit
        // );
      } else {
        highPriorityTasks = highPriorityTasks.slice(0, highPriorityLimitLeft);
        standardPriorityTasks = standardPriorityTasks.slice(
          0,
          standardPriorityLimitLeft
        );
      }

      // console.log(`AFTER LIMITING,`);
      // console.log(
      //   `HIGH PRIORITY TASKS : ${highPriorityTasks?.length},STANDARD PRIORITY TASKS FOUND: ${standardPriorityTasks?.length}`
      // );
      tasks = highPriorityTasks.concat(standardPriorityTasks);
    }

    /**
     * * If any these filters are present then order by is needed on columns that are derived from node and cadence.
     * * Since, custom task do not have node or cadence associated, change filter array to empty to avoid unknown column error
     */
    if (
      [
        TASK_FILTERS.SORT_BY_STEP,
        TASK_FILTERS.SORT_BY_TAG,
        TASK_FILTERS.INTERACTIONS_ONLY,
      ].includes(filter)
    )
      filterArray = [];

    // * if filter is custom task and type is without then avoid custom tasks
    if (
      !(filter === TASK_FILTERS.CUSTOM_TASK && sort_type === SORT_TYPES.WITHOUT)
    ) {
      [tasksWithNoNode, errForTasksWithNoNode] =
        await TaskRepository.fetchTaskWithNoNode(
          {
            ...taskQuery,
            node_id: {
              [Op.in]: Object.values(CUSTOM_TASK_NODE_ID),
            },
          },
          filterArray
        );

      if (errForTasksWithNoNode) return [null, errForTasksWithNoNode];
    }

    let result = [];

    // * If query params specified, return without sorting for urgent tasks
    if (filterArray?.length !== 0) {
      // console.log('DIRECT RETURN RESULT:  ', (new Date().getTime() - a) / 1000);
      result = tasksWithNoNode.concat(tasks);
    } else {
      // * If no filters found order should be urgent tasks,custom task and then other tasks
      // console.log('SORTING TASKS IN: ', (new Date().getTime() - a) / 1000);
      let urgentTasks = [];
      let notUrgentTasks = [];

      tasks.map((task) => {
        // console.log(
        //   `LEAD: ${task?.lead_id},CADENCE: ${task?.Lead?.LeadToCadences?.[0].cadence_id},LEAD_CADENCE_ORDER: ${task?.Lead?.LeadToCadences?.[0].lead_cadence_order}, LEAD_CADENCE_CREATED_AT: ${task?.Lead?.LeadToCadences?.[0].created_at}`
        // );
        // * Check if Cadence has tags and if it is urgent or not
        if (task?.Cadence?.Tags.length && task?.Cadence?.Tags[0].isUrgent)
          return urgentTasks.push(task);
        notUrgentTasks.push(task);
      });

      result = urgentTasks.concat(tasksWithNoNode).concat(notUrgentTasks);

      // console.log(
      //   'SORTED CUSTOM TASKS IN: ',
      //   (new Date().getTime() - a) / 1000
      // );
    }

    console.log('RESULT: ', result.length);
    return [result, null];
  } catch (err) {
    logger.error(
      `Error while fetching pending tasks in helper: ${err.message}.`
    );
    return [null, err.message];
  }
};

module.exports = getPendingTasks;
